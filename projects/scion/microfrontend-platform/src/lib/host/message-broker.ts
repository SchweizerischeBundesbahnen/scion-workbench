/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { concat, EMPTY, from, fromEvent, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError, filter, mergeMap, mergeMapTo, publishLast, refCount, share, take, takeUntil } from 'rxjs/operators';
import { IntentMessage, Message, MessageHeaders, TopicMessage } from '../messaging.model';
import { ConnackMessage, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { matchesCapabilityQualifier } from '../qualifier-tester';
import { Beans, PreDestroy } from '../bean-manager';
import { ApplicationRegistry } from './application.registry';
import { ManifestRegistry } from './manifest.registry';
import { UUID } from '@scion/toolkit/util';
import { PlatformState, PlatformStates } from '../platform-state';
import { Logger } from '../logger';
import { runSafe } from '../safe-runner';
import { PLATFORM_SYMBOLIC_NAME } from './platform.constants';
import { TopicSubscriptionRegistry } from './topic-subscription.registry';
import { Client, ClientRegistry } from './client.registry';
import { RetainedMessageStore } from './retained-message-store';
import { TopicMatcher } from './topic-matcher.util';

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
  private readonly _clientRequests$: Observable<ClientMessage>;

  private readonly _clientRegistry = new ClientRegistry();
  private readonly _topicSubscriptionRegistry = new TopicSubscriptionRegistry();
  private readonly _retainedMessageRegistry = new RetainedMessageStore();

  private readonly _applicationRegistry: ApplicationRegistry;
  private readonly _manifestRegistry: ManifestRegistry;

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
        const envelope: MessageEnvelope<TopicMessage<void>> = event.data;
        const clientWindow = event.source as Window;
        const clientAppName = envelope.message.headers.get(MessageHeaders.AppSymbolicName);

        const replyTo = envelope.message.headers.get(MessageHeaders.ReplyTo);
        const sender = {window: clientWindow, origin: event.origin};

        if (!clientAppName) {
          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:bad-request', returnMessage: `[MessageClientConnectError] Client connect attempt rejected by the message broker: Bad request. [origin='${event.origin}']`},
            headers: new Map(),
          });
          return;
        }

        const application = this._applicationRegistry.getApplication(clientAppName);
        if (!application) {
          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:rejected', returnMessage: `[MessageClientConnectError] Client connect attempt rejected by the message broker: Unknown client. [app='${clientAppName}']`},
            headers: new Map(),
          });
          return;
        }

        if (event.origin !== application.origin) {
          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:blocked', returnMessage: `[MessageClientConnectError] Client connect attempt blocked by the message broker: Wrong origin [actual='${event.origin}', expected='${application.origin}', app='${application.symbolicName}']`},
            headers: new Map(),
          });
          return;
        }

        const client: Client = new Client({id: UUID.randomUUID(), application: application, window: clientWindow});
        this._clientRegistry.registerClient(client);

        sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
          topic: replyTo,
          body: {returnCode: 'accepted', clientId: client.id},
          headers: new Map(),
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
        checkOriginTrusted<TopicMessage<void>>(this._clientRegistry, {transport: MessagingTransport.BrokerToGateway}),
        catchErrorAndRetry(),
        takeUntil(this._destroy$),
      )
      .subscribe((message: ClientMessage<TopicMessage<void>>) => runSafe(() => {
        this._clientRegistry.unregisterClient(message.client);
        this._topicSubscriptionRegistry.unsubscribeClient(message.client.id);
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
        const subscriberId = envelope.message.subscriberId;

        if (!topic) {
          const error = {type: 'TopicSubscribeError', details: 'Topic required'};
          sendDeliveryStatusError(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        this._topicSubscriptionRegistry.subscribe(topic, client, subscriberId);
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});

        // Dispatch the retained message on the topic, if any.
        const retainedMessage = this._retainedMessageRegistry.findMostRecentRetainedMessage(topic);
        if (retainedMessage) {
          const retainedMessageWorkingCopy = {
            ...retainedMessage,
            headers: new Map(retainedMessage.headers).set(MessageHeaders.ɵTopicSubscriberId, subscriberId),
            params: new TopicMatcher(topic).matcher(retainedMessage.topic).params,
          };
          sendTopicMessage(client, MessagingTransport.BrokerToClient, retainedMessageWorkingCopy);
        }
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

        this._topicSubscriptionRegistry.unsubscribe(topic, client.id);
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
        const topic = clientMessage.envelope.message.body;
        const replyTo = clientMessage.envelope.message.headers.get(MessageHeaders.ReplyTo);
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: clientMessage.envelope.messageId});

        this._topicSubscriptionRegistry.subscriptionCount$(topic)
          .pipe(takeUntil(this._topicSubscriptionRegistry.subscriptionCount$(replyTo).pipe(filter(count => count === 0))))
          .subscribe((count: number) => runSafe(() => {
            this.dispatchTopicMessage(UUID.randomUUID(), {
              topic: replyTo,
              body: count,
              headers: new Map().set(MessageHeaders.AppSymbolicName, PLATFORM_SYMBOLIC_NAME),
            });
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
        const messageId = clientMessage.envelope.messageId;
        const topicMessage = clientMessage.envelope.message;

        // If the message is marked as 'retained', store it, or if without a body, delete it.
        if (topicMessage.retain && this._retainedMessageRegistry.persistOrDelete(topicMessage) === 'deleted') {
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId});
          return; // delete event is not dispatched
        }

        // Dispatch the message.
        const dispatched = this.dispatchTopicMessage(messageId, topicMessage);

        // If request-reply communication, send an error if no replier is found to reply to the topic.
        if (topicMessage.headers.has(MessageHeaders.ReplyTo) && !dispatched) {
          const error = {type: 'RequestReplyError', details: `No replier found to reply to requests sent to topic '${topicMessage.topic}'.`};
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error);
        }
        else {
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId});
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
          .map(capability => this._clientRegistry.getByApplication(capability.metadata.symbolicAppName))
          .reduce((combined, list) => new Set([...combined, ...list]), new Set<Client>());

        clients.forEach(client => client.window.postMessage(envelope, client.application.origin));

        // if request-reply communication, send an error if no replier is found to reply to the intent.
        if (envelope.message.headers.has(MessageHeaders.ReplyTo) && clients.size === 0) {
          const error = {type: 'RequestReplyError', details: `No replier found to reply to intent '{type=${envelope.message.type}, qualifier=${JSON.stringify(envelope.message.qualifier)}}'.`};
          sendDeliveryStatusError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
        }
        else {
          sendDeliveryStatusSuccess(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
        }
      }));
  }

  /**
   * Dispatches the given topic message to subscribed clients on the transport {@link MessagingTransport.BrokerToClient}.
   *
   * @return `true` if dispatched the message to at minimum one subscriber, or `false` if no subscriber is subscribed to the given message topic.
   */
  private dispatchTopicMessage<BODY>(messageId: string, topicMessage: TopicMessage<BODY>): boolean {
    const destinations = this._topicSubscriptionRegistry.resolveTopicDestinations(topicMessage.topic);
    if (!destinations.length) {
      return false;
    }

    destinations.forEach(resolvedTopicDestination => {
      const envelope: MessageEnvelope<TopicMessage> = {
        messageId: messageId,
        transport: MessagingTransport.BrokerToClient,
        channel: MessagingChannel.Topic,
        message: {
          ...topicMessage,
          topic: resolvedTopicDestination.topic,
          params: resolvedTopicDestination.params,
          headers: new Map(topicMessage.headers).set(MessageHeaders.ɵTopicSubscriberId, resolvedTopicDestination.subscription.id),
        },
      };
      const client: Client = resolvedTopicDestination.subscription.client;
      client.window.postMessage(envelope, client.application.origin);
    });

    return true;
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
function checkOriginTrusted<MSG extends Message>(clientRegistry: ClientRegistry, rejectConfig: { transport: MessagingTransport }): OperatorFunction<MessageEvent, ClientMessage<MSG>> {
  return mergeMap((event: MessageEvent): Observable<ClientMessage> => {
    const envelope: MessageEnvelope = event.data;
    const senderWindow = event.source as Window;
    const clientId = envelope.message.headers.get(MessageHeaders.ClientId);
    const client = (senderWindow ? clientRegistry.getByClientWindow(senderWindow) : clientRegistry.getByClientId(clientId));

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
      envelope: event.data as MessageEnvelope<MSG>,
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

function sendDeliveryStatusSuccess(recipient: { window: Window; origin: string } | Client, destination: { transport: MessagingTransport, topic: string }): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination.transport, {
    topic: destination.topic,
    body: {ok: true},
    headers: new Map(),
  });
}

function sendDeliveryStatusError(recipient: { window: Window; origin: string } | Client, destination: { transport: MessagingTransport, topic: string }, error: { type: string; details: string }): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination.transport, {
    topic: destination.topic,
    body: {ok: false, details: `[${error.type}] ${error.details}`},
    headers: new Map(),
  });
}

function sendTopicMessage<T>(recipient: { window: Window; origin: string } | Client, transport: MessagingTransport, message: TopicMessage<T>): void {
  const envelope: MessageEnvelope<TopicMessage<T>> = {
    messageId: UUID.randomUUID(),
    transport: transport,
    channel: MessagingChannel.Topic,
    message: {...message},
  };

  envelope.message.params = new Map(envelope.message.params || new Map());
  envelope.message.headers = new Map(envelope.message.headers || new Map());

  const headers = envelope.message.headers;
  if (!headers.has(MessageHeaders.AppSymbolicName)) {
    headers.set(MessageHeaders.AppSymbolicName, PLATFORM_SYMBOLIC_NAME);
  }

  const target = recipient instanceof Client ? {window: recipient.window, origin: recipient.application.origin} : recipient;
  target.window.postMessage(envelope, target.origin);
}

/**
 * Represents a message send by a client connected to the message broker.
 */
interface ClientMessage<MSG extends Message = any> {
  envelope: MessageEnvelope<MSG>;
  client: Client;
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
