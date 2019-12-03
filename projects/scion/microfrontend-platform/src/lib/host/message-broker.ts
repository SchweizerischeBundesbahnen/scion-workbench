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
import { filter, first, map, mergeMap, mergeMapTo, publishLast, refCount, share, startWith, take, takeUntil } from 'rxjs/operators';
import { Application } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { BrokerDiscoverCommand, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { matchesCapabilityQualifier } from '../qualifier-tester';
import { Beans, PreDestroy } from '../bean-manager';
import { ApplicationRegistry } from './application.registry';
import { ManifestRegistry } from './manifest.registry';
import { UUID } from '@scion/toolkit/util';
import { MicrofrontendPlatformState, PlatformStates } from '../microfrontend-platform-state';

declare type ClientRegistry = Map<Window, Client>;

/**
 * Dispatches messages published by clients to subscribed and eligible clients.
 *
 * The broker supports topic-based and intent-based messaging.
 */
export class MessageBroker implements PreDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _clientRegistry = new Map<Window, Client>();
  private readonly _clientsByTopicMap = new Map<string, Set<Client>>();
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
        bufferUntil(Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Started)),
        checkOriginTrusted(this._clientRegistry, {transport: MessagingTransport.BrokerToClient}),
        share(),
      );

    // client lifecycle listeners
    this.installBrokerDiscoverListener();
    this.installClientDisposeListener();

    // message listeners
    this.installIntentMessageDispatcher();
    this.installTopicMessageDispatcher();

    // topic subscription listeners
    this.installTopicSubscribeListener();
    this.installTopicUnsubscribeListener();

    // reply to requests observing topic subscriptions
    this.installTopicSubscriberCountObserver();
  }

  private installBrokerDiscoverListener(): void {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByTransportAndTopic(MessagingTransport.GatewayToBroker, PlatformTopics.BrokerDiscovery),
        bufferUntil(Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Started)),
        takeUntil(this._destroy$),
      )
      .subscribe((event: MessageEvent) => {
        const envelope: MessageEnvelope<TopicMessage<BrokerDiscoverCommand>> = event.data;
        const clientWindow = event.source as Window;
        const clientAppName = envelope.message.payload.symbolicAppName;

        const replyTo = envelope.message.replyTo;
        const sender = {window: clientWindow, origin: event.origin};
        const destination = {transport: MessagingTransport.BrokerToGateway, topic: replyTo};

        if (!clientAppName) {
          const error = {type: 'MessageClientConnectError', details: `Client connect attempt rejected by the message broker: Invalid message format. [origin='${event.origin}']`};
          sendError(sender, destination, error);
          return;
        }

        const application = this._applicationRegistry.getApplication(clientAppName);
        if (!application) {
          const error = {type: 'MessageClientConnectError', details: `Client connect attempt rejected by the message broker: Client not registered as trusted application. [app='${clientAppName}']`};
          sendError(sender, destination, error);
          return;
        }

        if (event.origin !== application.origin) {
          const error = {type: 'MessageClientConnectError', details: `Client connect attempt blocked by the message broker: Wrong origin [actual='${event.origin}', expected='${application.origin}', app='${application.symbolicName}']`};
          sendError(sender, destination, error);
          return;
        }

        const client: Client = {application: application, window: clientWindow, origin: event.origin};
        this.unregisterClient(client);
        this._clientRegistry.set(clientWindow, client);
        sendSuccess(sender, destination);
      });
  }

  /**
   * Listens for client disconnect requests.
   */
  private installClientDisposeListener(): void {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByTransportAndTopic(MessagingTransport.GatewayToBroker, PlatformTopics.ClientDispose),
        bufferUntil(Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Started)),
        checkOriginTrusted<void>(this._clientRegistry, {transport: MessagingTransport.BrokerToGateway}),
        takeUntil(this._destroy$),
      )
      .subscribe((message: ClientMessage<void>) => {
        this.unregisterClient(message.client);
      });
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
      .subscribe((clientMessage: ClientMessage<TopicSubscribeCommand>) => {
        const client = clientMessage.client;
        const envelope = clientMessage.envelope;
        const topic = envelope.message.topic;

        if (!topic) {
          const error = {type: 'TopicSubscribeError', details: 'Topic required'};
          sendError(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        const clients = this._clientsByTopicMap.get(topic) || new Set<Client>();
        this._clientsByTopicMap.set(topic, clients.add(client));
        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
      });
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
      .subscribe((clientMessage: ClientMessage<TopicUnsubscribeCommand>) => {
        const client = clientMessage.client;
        const envelope = clientMessage.envelope;
        const topic = envelope.message.topic;

        if (!topic) {
          const error = {type: 'TopicUnsubscribeError', details: 'Topic required'};
          sendError(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        const clients = this._clientsByTopicMap.get(topic) || new Set<Client>();
        if (clients.delete(clientMessage.client) && clients.size === 0) {
          this._clientsByTopicMap.delete(topic);
        }

        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
      });
  }

  /**
   * Replies to requests to observe the number of subscribers on a topic.
   */
  private installTopicSubscriberCountObserver(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Topic),
        filterByTopic(PlatformTopics.SubscriberCount),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicMessage<string>>) => {
        const client = clientMessage.client;
        const topic = clientMessage.envelope.message.payload;
        const replyTo = clientMessage.envelope.message.replyTo;
        sendSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: clientMessage.envelope.messageId});

        this._topicSubscriberChange$
          .pipe(
            filter(event => event.topic === topic),
            map(event => event.subscriptionCount),
            startWith((this._clientsByTopicMap.get(topic) || new Set()).size),
            takeUntil(this._topicSubscriberChange$.pipe(first(change => change.topic === replyTo && change.subscriptionCount === 0))),
          )
          .subscribe((subscriptionCount: number) => {
            const envelope: MessageEnvelope<TopicMessage<number>> = {
              messageId: UUID.randomUUID(),
              channel: MessagingChannel.Topic,
              transport: MessagingTransport.BrokerToClient,
              message: {topic: replyTo, payload: subscriptionCount},
            };
            client.window.postMessage(envelope, client.application.origin);
          });
      });
  }

  /**
   * Listens for topic subscribe requests.
   */
  private installTopicMessageDispatcher(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Topic),
        filter(clientMessage => clientMessage.envelope.message.topic !== PlatformTopics.SubscriberCount), // do not dispatch messages sent to `SubscriberCount` topic
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicMessage>) => {
        const envelope: MessageEnvelope<TopicMessage> = {
          ...clientMessage.envelope,
          transport: MessagingTransport.BrokerToClient,
        };

        // dispatch the message asynchronously
        const clients = this._clientsByTopicMap.get(envelope.message.topic) || new Set();
        clients.forEach(client => asapScheduler.schedule(() => client.window.postMessage(envelope, client.application.origin)));

        // if request-reply communication, send an error if no replier is found to reply to the topic.
        if (envelope.message.replyTo !== undefined && clients.size === 0) {
          const error = {type: 'RequestReplyError', details: `No replier found to reply to requests published to topic '${envelope.message.topic}'.`};
          sendError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
        }
        else {
          sendSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
        }
      });
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
      .subscribe((clientMessage: ClientMessage<IntentMessage>) => {
        const envelope: MessageEnvelope<IntentMessage> = {
          ...clientMessage.envelope,
          transport: MessagingTransport.BrokerToClient,
        };

        const intent = envelope.message;
        const senderClient = clientMessage.client;

        if (!intent) {
          const error = {type: 'IntentDispatchrror', details: 'Intent must not be null'};
          sendError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!intent.type) {
          const error = {type: 'IntentDispatchError', details: 'Intent type required'};
          sendError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!this._manifestRegistry.hasIntent(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NotQualifiedError', details: `Application '${senderClient.application.symbolicName}' is not qualified to publish intents of the type '${intent.type}' and qualifier '${JSON.stringify(intent.qualifier || {})}'. Ensure to have listed the intent in the application manifest.`};
          sendError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
          return;
        }

        if (!this._manifestRegistry.isHandled(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NullProviderError', details: `No application found to provide a capability of the type '${intent.type}' and qualifiers '${JSON.stringify(intent.qualifier || {})}'. Maybe, the capability is not public API or the providing application not available.`};
          sendError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
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
          sendError(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId}, error);
        }
        else {
          sendSuccess(senderClient, {transport: MessagingTransport.BrokerToClient, topic: envelope.messageId});
        }
      });
  }

  private unregisterClient(client: Client): void {
    const clientWindow = client.window;
    this._clientRegistry.delete(clientWindow);

    this._clientsByTopicMap.forEach((clients: Set<Client>, topic: string) => {
      if (clients.delete(client) && clients.size === 0) {
        this._clientsByTopicMap.delete(topic);
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
  return pipe(
    filter((event: MessageEvent): boolean => {
      const senderClientWindow = event.source as Window;
      const senderClient = clientRegistry.get(senderClientWindow);
      const envelope: MessageEnvelope = event.data;

      if (!senderClient) {
        const sender = {window: senderClientWindow, origin: event.origin};
        const error = {type: 'MessagingError', details: `Message rejected: Client not registered [origin=${event.origin}]`};
        sendError(sender, {transport: rejectConfig.transport, topic: envelope.messageId}, error);
        return false;
      }

      if (event.origin !== senderClient.application.origin) {
        const target = {window: senderClientWindow, origin: event.origin};
        const error = {type: 'MessagingError', details: `Message rejected: Wrong origin [actual=${event.origin}, expected=${senderClient.application.origin}, application=${senderClient.application.symbolicName}]`};
        sendError(target, {transport: rejectConfig.transport, topic: envelope.messageId}, error);
        return false;
      }

      return true;
    }),
    map((event: MessageEvent): ClientMessage<T> => {
      return {
        envelope: event.data as MessageEnvelope<T>,
        client: clientRegistry.get(event.source as Window),
      };
    }),
  );
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

function sendSuccess(recipient: { window: Window; origin: string }, destination: { transport: MessagingTransport, topic: string }): void {
  const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = {
    messageId: UUID.randomUUID(),
    transport: destination.transport,
    channel: MessagingChannel.Topic,
    message: {
      topic: destination.topic,
      payload: {ok: true},
    },
  };
  recipient.window.postMessage(envelope, recipient.origin);
}

function sendError(recipient: { window: Window; origin: string }, destination: { transport: MessagingTransport, topic: string }, error: { type: string; details: string }): void {
  const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = {
    messageId: UUID.randomUUID(),
    transport: destination.transport,
    channel: MessagingChannel.Topic,
    message: {
      topic: destination.topic,
      payload: {
        ok: false,
        details: `[${error.type}] ${error.details}`,
      },
    },
  };
  recipient.window.postMessage(envelope, recipient.origin);
}

/**
 * Represents a client which is connected to the message broker.
 */
interface Client {
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
