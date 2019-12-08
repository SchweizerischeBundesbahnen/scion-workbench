/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { asapScheduler, concat, EMPTY, from, fromEvent, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError, filter, first, map, mergeMap, mergeMapTo, publishLast, refCount, share, startWith, take, takeUntil } from 'rxjs/operators';
import { Application } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { ConnackMessage, ConnectMessage, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { matchesCapabilityQualifier } from '../qualifier-tester';
import { Beans, PreDestroy } from '../bean-manager';
import { ApplicationRegistry } from './application.registry';
import { ManifestRegistry } from './manifest.registry';
import { UUID } from '@scion/toolkit/util';
import { PlatformState, PlatformStates } from '../platform-state';
import { Logger } from '../logger';

declare type ClientRegistry = Map<Window, Client>;
const messageBrokerId = UUID.randomUUID();

/**
 * The broker is responsible for receiving all messages, filtering the messages, determining who is
 * subscribed to each message, and sending the message to these subscribed clients.
 *
 * The broker allows topic-based and intent-based messaging and supports retained messages.
 *
 * When the broker receives a message from a client, the broker identifies the sending client using the {@Window}
 * contained in the {@link MessageEvent}. The user agent sets the window, which cannot be tampered by the client.
 * However, when the client unloads, the window is not set because already been destroyed. Then, the broker identifies
 * the client using the unique client id. In both cases, the broker checks the origin of the message to match the
 * origin of the registered application.
 */
export class MessageBroker implements PreDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _clientRegistry = new Map<Window, Client>();
  private readonly _clientsByTopic = new Map<string, Set<Client>>();
  private readonly _retainedMessagesByTopic = new Map<string, TopicMessage>();
  private readonly _clientRequests$: Observable<ClientMessage>;

  private readonly _applicationRegistry: ApplicationRegistry;
  private readonly _manifestRegistry: ManifestRegistry;
  private readonly _topicSubscriberChange$ = new Subject<TopicSubscriberChangeEvent>();

  constructor() {
    this._applicationRegistry = Beans.get(ApplicationRegistry);
    this._manifestRegistry = Beans.get(ManifestRegistry);

    // Construct a stream of messages sent by clients.
    this._clientRequests$ = fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterMessage(MessagingTransport.ClientToBroker),
        bufferUntil(Beans.get(PlatformState).whenState(PlatformStates.Started)),
        checkOriginTrusted(this._clientRegistry, {transport: MessagingTransport.BrokerToClient}),
        catchErrorAndRetry(),
        share(),
      );

    // client connect listeners
    this.installClientConnectListener();
    this.installClientDisconnectListener();

    // message listeners
    this.installIntentMessageDispatcher();
    this.installTopicMessageDispatcher();

    // topic subscription listeners
    this.installTopicSubscribeListener();
    this.installTopicUnsubscribeListener();

    // reply to requests observing topic subscriptions
    this.installTopicSubscriberCountObserver();
  }

  private installClientConnectListener(): void {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByTransportAndTopic(MessagingTransport.GatewayToBroker, PlatformTopics.ClientConnect),
        bufferUntil(Beans.get(PlatformState).whenState(PlatformStates.Started)),
        catchErrorAndRetry(),
        takeUntil(this._destroy$),
      )
      .subscribe((event: MessageEvent) => runSafe(() => {
        const envelope: MessageEnvelope<TopicMessage<ConnectMessage>> = event.data;
        const clientWindow = event.source as Window;
        const clientAppName = envelope.message.payload.symbolicAppName;

        const replyTo = envelope.message.replyTo;
        const sender = {window: clientWindow, origin: event.origin};
        const destination = {transport: MessagingTransport.BrokerToGateway, topic: replyTo};

        if (!clientAppName) {
          sendTopicMessage<ConnackMessage>(sender, destination, {
            returnCode: 'refused:bad-request',
            returnMessage: `[MessageClientConnectError] Client connect attempt rejected by the message broker: Bad request. [origin='${event.origin}']`,
          });
          return;
        }

        const application = this._applicationRegistry.getApplication(clientAppName);
        if (!application) {
          sendTopicMessage<ConnackMessage>(sender, destination, {
            returnCode: 'refused:rejected',
            returnMessage: `[MessageClientConnectError] Client connect attempt rejected by the message broker: Unknown client. [app='${clientAppName}']`,
          });
          return;
        }

        if (event.origin !== application.origin) {
          sendTopicMessage<ConnackMessage>(sender, destination, {
            returnCode: 'refused:blocked',
            returnMessage: `[MessageClientConnectError] Client connect attempt blocked by the message broker: Wrong origin [actual='${event.origin}', expected='${application.origin}', app='${application.symbolicName}']`,
          });
          return;
        }

        const client: Client = {id: UUID.randomUUID(), application: application, window: clientWindow, origin: event.origin};
        this.unregisterClient(client);
        this._clientRegistry.set(clientWindow, client);
        sendTopicMessage<ConnackMessage>(sender, destination, {
          returnCode: 'accepted',
          clientId: client.id,
        });
      }));
  }

  /**
   * Listens for client disconnect requests.
   */
  private installClientDisconnectListener(): void {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByTransportAndTopic(MessagingTransport.GatewayToBroker, PlatformTopics.ClientDisconnect),
        bufferUntil(Beans.get(PlatformState).whenState(PlatformStates.Started)),
        checkOriginTrusted<void>(this._clientRegistry, {transport: MessagingTransport.BrokerToGateway}),
        catchErrorAndRetry(),
        takeUntil(this._destroy$),
      )
      .subscribe((message: ClientMessage<void>) => runSafe(() => {
        this.unregisterClient(message.client);
      }));
  }

  /**
   * Listens for topic subscribe requests.
   */
  private installTopicSubscribeListener(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.TopicSubscribe),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicSubscribeCommand>) => runSafe(() => {
        const client = clientMessage.client;
        const envelope = clientMessage.envelope;
        const topic = envelope.message.topic;

        if (!topic) {
          const error = {type: 'TopicSubscribeError', details: 'Topic required'};
          sendDeliveryStatusError(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        const clients = this._clientsByTopic.get(topic) || new Set<Client>();
        this._clientsByTopic.set(topic, clients.add(client));

        // Dispatch the retained message on the topic, if any.
        const retainedMessage = this._retainedMessagesByTopic.get(topic);
        if (retainedMessage) {
          sendTopicMessage(client, {transport: MessagingTransport.BrokerToClient, topic: topic}, retainedMessage.payload);
        }

        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
      }));
  }

  /**
   * Listens for topic unsubscribe requests.
   */
  private installTopicUnsubscribeListener(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.TopicUnsubscribe),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicUnsubscribeCommand>) => runSafe(() => {
        const client = clientMessage.client;
        const envelope = clientMessage.envelope;
        const topic = envelope.message.topic;

        if (!topic) {
          const error = {type: 'TopicUnsubscribeError', details: 'Topic required'};
          sendDeliveryStatusError(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        const clients = this._clientsByTopic.get(topic) || new Set<Client>();
        if (clients.delete(clientMessage.client) && clients.size === 0) {
          this._clientsByTopic.delete(topic);
        }

        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
      }));
  }

  /**
   * Replies to requests to observe the number of subscribers on a topic.
   */
  private installTopicSubscriberCountObserver(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Topic),
        filterByTopic(PlatformTopics.RequestSubscriberCount),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicMessage<string>>) => runSafe(() => {
        const client = clientMessage.client;
        const topic = clientMessage.envelope.message.payload;
        const replyTo = clientMessage.envelope.message.replyTo;
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: clientMessage.envelope.messageId});

        this._topicSubscriberChange$
          .pipe(
            filter(event => event.topic === topic),
            map(event => event.subscriptionCount),
            startWith((this._clientsByTopic.get(topic) || new Set()).size),
            takeUntil(this._topicSubscriberChange$.pipe(first(change => change.topic === replyTo && change.subscriptionCount === 0))),
          )
          .subscribe((subscriptionCount: number) => runSafe(() => {
            const envelope: MessageEnvelope<TopicMessage<number>> = {
              senderId: messageBrokerId,
              messageId: UUID.randomUUID(),
              channel: MessagingChannel.Topic,
              transport: MessagingTransport.BrokerToClient,
              message: {topic: replyTo, payload: subscriptionCount},
            };
            client.window.postMessage(envelope, client.application.origin);
          }));
      }));
  }

  /**
   * Listens for topic subscribe requests.
   */
  private installTopicMessageDispatcher(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Topic),
        filter(clientMessage => clientMessage.envelope.message.topic !== PlatformTopics.RequestSubscriberCount), // do not dispatch messages sent to `SubscriberCount` topic
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicMessage>) => runSafe(() => {
        const envelope: MessageEnvelope<TopicMessage> = {
          ...clientMessage.envelope,
          transport: MessagingTransport.BrokerToClient,
        };
        const topicMessage = envelope.message;

        // If the message is marked as 'retained', store it, or if without payload, delete it.
        if (topicMessage.retain && topicMessage.payload === undefined || topicMessage.payload === null) {
          this._retainedMessagesByTopic.delete(topicMessage.topic);
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
          return; // do not dispatch the 'delete' message.
        }
        if (topicMessage.retain) {
          this._retainedMessagesByTopic.set(topicMessage.topic, topicMessage);
        }

        // Dispatch the message asynchronously.
        const clients = this._clientsByTopic.get(topicMessage.topic) || new Set();
        clients.forEach(client => asapScheduler.schedule(() => client.window.postMessage(envelope, client.application.origin)));

        // If request-reply communication, send an error if no replier is found to reply to the topic.
        if (topicMessage.replyTo !== undefined && clients.size === 0) {
          const error = {type: 'RequestReplyError', details: `No replier found to reply to requests sent to topic '${topicMessage.topic}'.`};
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
        }
        else {
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
        }
      }));
  }

  /**
   * Listens for intents issued by clients.
   */
  private installIntentMessageDispatcher(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Intent),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<IntentMessage>) => runSafe(() => {
        const envelope: MessageEnvelope<IntentMessage> = {
          ...clientMessage.envelope,
          transport: MessagingTransport.BrokerToClient,
        };

        const intent = envelope.message;
        const senderClient = clientMessage.client;

        if (!intent) {
          const error = {type: 'IntentDispatchrror', details: 'Intent must not be null'};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!intent.type) {
          const error = {type: 'IntentDispatchError', details: 'Intent type required'};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!this._manifestRegistry.hasIntent(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NotQualifiedError', details: `Application '${senderClient.application.symbolicName}' is not qualified to publish intents of the type '${intent.type}' and qualifier '${JSON.stringify(intent.qualifier || {})}'. Ensure to have listed the intent in the application manifest.`};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!this._manifestRegistry.isHandled(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NullProviderError', details: `No application found to provide a capability of the type '${intent.type}' and qualifiers '${JSON.stringify(intent.qualifier || {})}'. Maybe, the capability is not public API or the providing application not available.`};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        // find clients fulfilling the intent.
        const clients: Set<Client> = this._manifestRegistry.getCapabilitiesByType(intent.type)
          .filter(capability => matchesCapabilityQualifier(capability.qualifier, intent.qualifier))
          .filter(capability => this._manifestRegistry.isVisibleForApplication(capability, senderClient.application.symbolicName))
          .map(capability => Array.from(this._clientRegistry.values()).filter(client => client.application.symbolicName === capability.metadata.symbolicAppName))
          .reduce((combined, list) => new Set([...combined, ...list]), new Set<Client>());

        clients.forEach(client => asapScheduler.schedule(() => client.window.postMessage(envelope, client.application.origin)));

        // if request-reply communication, send an error if no replier is found to reply to the intent.
        if (envelope.message.replyTo !== undefined && clients.size === 0) {
          const error = {type: 'RequestReplyError', details: `No replier found to reply to intent '{type=${envelope.message.type}, qualifier=${JSON.stringify(envelope.message.qualifier)}}'.`};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
        }
        else {
          sendDeliveryStatusSuccess(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
        }
      }));
  }

  private unregisterClient(client: Client): void {
    const clientWindow = client.window;
    this._clientRegistry.delete(clientWindow);

    // unregister the client from all topics
    this._clientsByTopic.forEach((clients: Set<Client>, topic: string) => {
      const subscribed = clients.delete(client);
      if (subscribed && clients.size === 0) {
        this._clientsByTopic.delete(topic);
      }

      if (subscribed) {
        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
      }
    });
  }

  /** @internal **/
  public preDestroy(): void {
    this._destroy$.next();
  }
}

function filterMessage<M>(transport: MessagingTransport, channel?: MessagingChannel): MonoTypeOperatorFunction<MessageEvent> {
  return filter((messageEvent: MessageEvent): boolean => {
    const envelope: MessageEnvelope = messageEvent.data;
    if (!envelope) {
      return false;
    }
    else if (envelope.transport !== transport) {
      return false;
    }
    else if (channel && envelope.channel !== channel) {
      return false;
    }
    return true;
  });
}

/**
 * Returns a filter which passes all messages of given {@link MessagingChannel}.
 */
function filterByChannel(channel: MessagingChannel): MonoTypeOperatorFunction<ClientMessage> {
  return filter((message: ClientMessage): boolean => {
    return message.envelope.channel === channel;
  });
}

/**
 * Passes only messages originating from trusted and registered clients.
 */
function checkOriginTrusted<T>(clientRegistry: ClientRegistry, rejectConfig: { transport: MessagingTransport }): OperatorFunction<MessageEvent, ClientMessage<T>> {
  return mergeMap((event: MessageEvent): Observable<ClientMessage> => {
    const envelope: MessageEnvelope = event.data;
    const senderWindow = event.source as Window;
    const client = (senderWindow ? clientRegistry.get(senderWindow) : Array.from(clientRegistry.values()).find(candidate => candidate.id === envelope.senderId));

    if (!client) {
      const sender = {window: senderWindow, origin: event.origin};
      const error = {type: 'MessagingError', details: `Message rejected: Client not registered [origin=${event.origin}]`};
      sender.window && sendDeliveryStatusError(sender, {transport: rejectConfig.transport, topic: envelope.messageId}, error);
      return EMPTY;
    }

    if (event.origin !== client.application.origin) {
      const target = {window: client.window, origin: event.origin};
      const error = {type: 'MessagingError', details: `Message rejected: Wrong origin [actual=${event.origin}, expected=${client.application.origin}, application=${client.application.symbolicName}]`};
      sendDeliveryStatusError(target, {transport: rejectConfig.transport, topic: envelope.messageId}, error);
      return EMPTY;
    }

    return of({
      envelope: event.data as MessageEnvelope<T>,
      client: client,
    });
  });
}

export function filterByTopic(topic: string): MonoTypeOperatorFunction<ClientMessage<TopicMessage>> {
  return filter((clientMessage: ClientMessage<TopicMessage>): boolean => {
    return clientMessage.envelope.message.topic === topic;
  });
}

export function filterByTransportAndTopic(transport: MessagingTransport, topic: string): MonoTypeOperatorFunction<MessageEvent> {
  return pipe(
    filterMessage(transport, MessagingChannel.Topic),
    filter((event: MessageEvent): boolean => {
      const envelope = event.data as MessageEnvelope<TopicMessage>;
      return envelope.message.topic === topic;
    }),
  );
}

function sendDeliveryStatusSuccess(recipient: { window: Window; origin: string }, destination: { transport: MessagingTransport, topic: string }): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination, {ok: true});
}

function sendDeliveryStatusError(recipient: { window: Window; origin: string }, destination: { transport: MessagingTransport, topic: string }, error: { type: string; details: string }): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination, {ok: false, details: `[${error.type}] ${error.details}`});
}

function sendTopicMessage<T>(recipient: { window: Window; origin: string }, destination: { transport: MessagingTransport, topic: string }, payload: T): void {
  const envelope: MessageEnvelope<TopicMessage<T>> = {
    senderId: messageBrokerId,
    messageId: UUID.randomUUID(),
    transport: destination.transport,
    channel: MessagingChannel.Topic,
    message: {
      topic: destination.topic,
      payload: payload,
    },
  };
  recipient.window.postMessage(envelope, recipient.origin);
}

/**
 * Represents a client which is connected to the message broker.
 */
interface Client {
  id: string;
  window: Window;
  application: Application;
  origin: string;
}

/**
 * Represents a message send by a client connected to the message broker.
 */
interface ClientMessage<M = any> {
  envelope: MessageEnvelope<M>;
  client: Client;
}

/**
 * Informs about a subscription change on a topic.
 */
interface TopicSubscriberChangeEvent {
  topic: string;
  subscriptionCount: number;
}

/**
 * Buffers the source Observable values until `closingNotifier$` emits.
 * Once closed, items of the source Observable are emitted as they arrive.
 */
function bufferUntil<T>(closingNotifier$: Observable<any> | Promise<any>): OperatorFunction<T, T> {
  const guard$ = from(closingNotifier$).pipe(take(1), publishLast(), refCount(), mergeMapTo(EMPTY));
  return mergeMap((item: T) => concat(guard$, of(item)));
}

/**
 * Catches and logs errors, and resubscribes to the source observable.
 */
function catchErrorAndRetry<T>(): MonoTypeOperatorFunction<T> {
  return catchError((error, caught) => {
    Beans.get(Logger).error('[UnexpectedError] An unexpected error occurred.', error);
    return caught;
  });
}

/**
 * Runs the given function. Errors are catched and logged.
 */
function runSafe(runnable: () => void): void {
  try {
    runnable();
  }
  catch (error) {
    Beans.get(Logger).error('[UnexpectedError] An unexpected error occurred.', error);
  }
}
