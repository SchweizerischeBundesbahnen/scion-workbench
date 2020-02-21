/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { EMPTY, fromEvent, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError, filter, mergeMap, share, takeUntil } from 'rxjs/operators';
import { IntentMessage, Message, MessageHeaders, TopicMessage } from '../../messaging.model';
import { ConnackMessage, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../../ɵmessaging.model';
import { Beans, PreDestroy } from '../../bean-manager';
import { ApplicationRegistry } from '../application-registry';
import { ManifestRegistry } from '../manifest-registry/manifest-registry';
import { Maps, UUID } from '@scion/toolkit/util';
import { PlatformState, PlatformStates } from '../../platform-state';
import { Logger } from '../../logger';
import { runSafe } from '../../safe-runner';
import { PLATFORM_SYMBOLIC_NAME } from '../platform.constants';
import { TopicSubscriptionRegistry } from './topic-subscription.registry';
import { Client, ClientRegistry } from './client.registry';
import { RetainedMessageStore } from './retained-message-store';
import { TopicMatcher } from '../../topic-matcher.util';
import { bufferUntil } from '../../operators';
import { chainInterceptors, IntentInterceptor, MessageInterceptor, PublishInterceptorChain } from './message-interception';
import { CapabilityProvider } from '../../platform.model';

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
 *
 * @ignore
 */
export class MessageBroker implements PreDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _clientRequests$: Observable<ClientMessage>;

  private readonly _clientRegistry = Beans.get(ClientRegistry);
  private readonly _topicSubscriptionRegistry = new TopicSubscriptionRegistry();
  private readonly _retainedMessageRegistry = new RetainedMessageStore();

  private readonly _applicationRegistry: ApplicationRegistry;
  private readonly _manifestRegistry: ManifestRegistry;

  private _messagePublisher: PublishInterceptorChain<TopicMessage>;
  private _intentPublisher: PublishInterceptorChain<IntentMessage>;

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

    // Install client connect listeners.
    this.installClientConnectListener();
    this.installClientDisconnectListener();

    // Install message dispatchers.
    this.installTopicMessageDispatcher();
    this.installIntentMessageDispatcher();

    // Install topic subscriptions listeners.
    this.installTopicSubscribeListener();
    this.installTopicUnsubscribeListener();
    this.installTopicSubscriberCountObserver();

    // Assemble message interceptors to a chain of handlers which are called one after another. The publisher is added as terminal handler.
    this._messagePublisher = this.createMessagePublisher();
    this._intentPublisher = this.createIntentPublisher();
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
        const gatewayWindow = event.source as Window;
        const clientAppName = envelope.message.headers.get(MessageHeaders.AppSymbolicName);

        const replyTo = envelope.message.headers.get(MessageHeaders.ReplyTo);
        const sender = {gatewayWindow, origin: event.origin};

        if (!clientAppName) {
          const warning = `Client connect attempt rejected by the message broker: Bad request. [origin='${event.origin}']`;
          Beans.get(Logger).warn(`[WARNING] ${warning}`);
          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:bad-request', returnMessage: `[MessageClientConnectError] ${warning}`},
            headers: new Map(),
          });
          return;
        }

        const application = this._applicationRegistry.getApplication(clientAppName);
        if (!application) {
          const warning = `Client connect attempt rejected by the message broker: Unknown client. [app='${clientAppName}']`;
          Beans.get(Logger).warn(`[WARNING] ${warning}`);
          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:rejected', returnMessage: `[MessageClientConnectError] ${warning}`},
            headers: new Map(),
          });
          return;
        }

        if (event.origin !== application.origin) {
          const warning = `Client connect attempt blocked by the message broker: Wrong origin [actual='${event.origin}', expected='${application.origin}', app='${application.symbolicName}']`;
          Beans.get(Logger).warn(`[WARNING] ${warning}`);

          sendTopicMessage<ConnackMessage>(sender, MessagingTransport.BrokerToGateway, {
            topic: replyTo,
            body: {returnCode: 'refused:blocked', returnMessage: `[MessageClientConnectError] ${warning}`},
            headers: new Map(),
          });
          return;
        }

        const client: Client = new Client({id: UUID.randomUUID(), application, gatewayWindow, window: gatewayWindow.parent});
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
        const messageId = envelope.message.headers.get(MessageHeaders.MessageId);

        if (!topic) {
          sendDeliveryStatusError(client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, '[TopicSubscribeError] Topic required');
          return;
        }

        this._topicSubscriptionRegistry.subscribe(topic, client, subscriberId);
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: messageId});

        // Dispatch a retained message, if any.
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
        const messageId = envelope.message.headers.get(MessageHeaders.MessageId);

        if (!topic) {
          sendDeliveryStatusError(client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, '[TopicUnsubscribeError] Topic required');
          return;
        }

        this._topicSubscriptionRegistry.unsubscribe(topic, client.id);
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: messageId});
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
        const request = clientMessage.envelope.message;
        const topic = request.body;
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const messageId = request.headers.get(MessageHeaders.MessageId);
        sendDeliveryStatusSuccess(client, {transport: MessagingTransport.BrokerToClient, topic: messageId});

        this._topicSubscriptionRegistry.subscriptionCount$(topic)
          .pipe(takeUntil(this._topicSubscriptionRegistry.subscriptionCount$(replyTo).pipe(filter(count => count === 0))))
          .subscribe((count: number) => runSafe(() => {
            this.dispatchTopicMessage({
              topic: replyTo,
              body: count,
              headers: new Map()
                .set(MessageHeaders.MessageId, UUID.randomUUID())
                .set(MessageHeaders.AppSymbolicName, PLATFORM_SYMBOLIC_NAME),
            });
          }));
      }));
  }

  /**
   * Dispatches topic messages to subscribed clients.
   */
  private installTopicMessageDispatcher(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Topic),
        filter(clientMessage => clientMessage.envelope.message.topic !== PlatformTopics.RequestSubscriberCount), // do not dispatch messages sent to the `RequestSubscriberCount` topic as handled separately
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<TopicMessage>) => runSafe(() => {
        const topicMessage = clientMessage.envelope.message;
        const messageId = topicMessage.headers.get(MessageHeaders.MessageId);

        try {
          this._messagePublisher.publish(topicMessage);
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId});
        }
        catch (error) {
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error.message || error.message.toString());
        }
      }));
  }

  /**
   * Dispatches intents to qualified clients.
   */
  private installIntentMessageDispatcher(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.Intent),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<IntentMessage>) => runSafe(() => {
        const intentMessage = clientMessage.envelope.message;
        const messageId = intentMessage.headers.get(MessageHeaders.MessageId);

        if (!intentMessage.intent) {
          const error = '[IntentDispatchError] Intent required';
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error);
          return;
        }

        if (!intentMessage.intent.type) {
          const error = '[IntentDispatchError] Intent type required';
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error);
          return;
        }

        if (!this._manifestRegistry.hasIntention(intentMessage.intent, clientMessage.client.application.symbolicName)) {
          const error = `[NotQualifiedError] Application '${clientMessage.client.application.symbolicName}' is not qualified to publish intents of the type '${intentMessage.intent.type}' and qualifier '${JSON.stringify(intentMessage.intent.qualifier || {})}'. Ensure to have listed the intention in the application manifest.`;
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error);
          return;
        }

        try {
          this._intentPublisher.publish(intentMessage);
          sendDeliveryStatusSuccess(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId});
        }
        catch (error) {
          sendDeliveryStatusError(clientMessage.client, {transport: MessagingTransport.BrokerToClient, topic: messageId}, error.message || error.message.toString());
        }
      }));
  }

  /**
   * Creates the interceptor chain to intercept message publishing. The publisher is added as terminal handler.
   */
  private createMessagePublisher(): PublishInterceptorChain<TopicMessage> {
    return chainInterceptors(Beans.all(MessageInterceptor), (message: TopicMessage): void => {
      // If the message is marked as 'retained', store it, or if without a body, delete it.
      if (message.retain && this._retainedMessageRegistry.persistOrDelete(message) === 'deleted') {
        return; // Deletion events for retained messages are swallowed.
      }

      // Dispatch the message.
      const dispatched = this.dispatchTopicMessage(message);

      // If request-reply communication, throw an error if no replier is found to reply to the topic.
      if (!dispatched && message.headers.has(MessageHeaders.ReplyTo)) {
        throw Error(`[RequestReplyError] No client is currently running which could answer the request sent to the topic '${message.topic}'.`);
      }
    });
  }

  /**
   * Creates the interceptor chain to intercept intent publishing. The publisher is added as terminal handler.
   */
  private createIntentPublisher(): PublishInterceptorChain<IntentMessage> {
    return chainInterceptors(Beans.all(IntentInterceptor), (message: IntentMessage): void => {
      // Find providers which provide a satisfying capability for the intent.
      const capabilityProviders = this._manifestRegistry.getCapabilityProvidersByIntent(message.intent, message.headers.get(MessageHeaders.AppSymbolicName));
      if (capabilityProviders.length === 0) {
        throw Error(`[NullProviderError] No application found to provide a capability of the type '${message.intent.type}' and qualifiers '${JSON.stringify(message.intent.qualifier || {})}'. Maybe, the capability is not public API or the providing application not available.`);
      }

      // Resolve clients of the found providers.
      const capabilityProvidersByClientMap = new Map<Client, Set<CapabilityProvider>>();
      capabilityProviders.forEach(capabilityProvider => {
        const clients = this._clientRegistry.getByApplication(capabilityProvider.metadata.appSymbolicName);
        clients.forEach(client => Maps.addSetValue(capabilityProvidersByClientMap, client, capabilityProvider));
      });

      // If request-reply communication, send an error if no replier is found to reply to the intent.
      if (capabilityProvidersByClientMap.size === 0 && message.headers.has(MessageHeaders.ReplyTo)) {
        throw Error(`[RequestReplyError] No client is currently running which could answer the intent '{type=${message.intent.type}, qualifier=${JSON.stringify(message.intent.qualifier)}}'.`);
      }

      // Dispatch the intent.
      capabilityProvidersByClientMap.forEach((capabilities, client) => {
        if (capabilities.size > 1) {
          Beans.get(Logger).warn(`Intent cannot be uniquely resolved to a capability. The application '${client.application.symbolicName}' provides multiple matching capabilities. Most likely this is not intended and may indicate an incorrect manifest configuration.`, capabilities);
        }
        capabilities.forEach(capability => {
          const envelope: MessageEnvelope<IntentMessage> = {
            transport: MessagingTransport.BrokerToClient,
            channel: MessagingChannel.Intent,
            message: {
              ...message,
              capability,
            },
          };
          client.gatewayWindow.postMessage(envelope, client.application.origin);
        });
      });
    });
  }

  /**
   * Dispatches the given topic message to subscribed clients on the transport {@link MessagingTransport.BrokerToClient}.
   *
   * @return `true` if dispatched the message to at minimum one subscriber, or `false` if no subscriber is subscribed to the given message topic.
   */
  private dispatchTopicMessage<BODY>(topicMessage: TopicMessage<BODY>): boolean {
    const destinations = this._topicSubscriptionRegistry.resolveTopicDestinations(topicMessage.topic);
    if (!destinations.length) {
      return false;
    }

    destinations.forEach(resolvedTopicDestination => {
      const envelope: MessageEnvelope<TopicMessage> = {
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
      client.gatewayWindow.postMessage(envelope, client.application.origin);
    });

    return true;
  }

  /** @internal **/
  public preDestroy(): void {
    this._destroy$.next();
  }
}

/** @ignore **/
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
 *
 * @ignore
 */
function filterByChannel(channel: MessagingChannel): MonoTypeOperatorFunction<ClientMessage> {
  return filter((message: ClientMessage): boolean => {
    return message.envelope.channel === channel;
  });
}

/**
 * Passes only messages originating from trusted and registered clients.
 *
 * @ignore
 */
function checkOriginTrusted<MSG extends Message>(clientRegistry: ClientRegistry, rejectConfig: { transport: MessagingTransport }): OperatorFunction<MessageEvent, ClientMessage<MSG>> {
  return mergeMap((event: MessageEvent): Observable<ClientMessage> => {
    const envelope: MessageEnvelope = event.data;
    const senderGatewayWindow = event.source as Window;
    const clientId = envelope.message.headers.get(MessageHeaders.ClientId);
    const messageId = envelope.message.headers.get(MessageHeaders.MessageId);
    const client = (senderGatewayWindow ? clientRegistry.getByGatewayWindow(senderGatewayWindow) : clientRegistry.getByClientId(clientId));

    if (!client) {
      const sender = {gatewayWindow: senderGatewayWindow, origin: event.origin};
      const error = `[MessagingError] Message rejected: Client not registered [origin=${event.origin}]`;
      sender.gatewayWindow && sendDeliveryStatusError(sender, {transport: rejectConfig.transport, topic: messageId}, error);
      return EMPTY;
    }

    if (event.origin !== client.application.origin) {
      const target = {gatewayWindow: client.gatewayWindow, origin: event.origin};
      const error = `[MessagingError] Message rejected: Wrong origin [actual=${event.origin}, expected=${client.application.origin}, application=${client.application.symbolicName}]`;
      sendDeliveryStatusError(target, {transport: rejectConfig.transport, topic: messageId}, error);
      return EMPTY;
    }

    return of({
      envelope: event.data as MessageEnvelope<MSG>,
      client: client,
    });
  });
}

/** @ignore **/
export function filterByTopic(topic: string): MonoTypeOperatorFunction<ClientMessage<TopicMessage>> {
  return filter((clientMessage: ClientMessage<TopicMessage>): boolean => {
    return clientMessage.envelope.message.topic === topic;
  });
}

/** @ignore **/
export function filterByTransportAndTopic(transport: MessagingTransport, topic: string): MonoTypeOperatorFunction<MessageEvent> {
  return pipe(
    filterMessage(transport, MessagingChannel.Topic),
    filter((event: MessageEvent): boolean => {
      const envelope = event.data as MessageEnvelope<TopicMessage>;
      return envelope.message && envelope.message.topic === topic;
    }),
  );
}

/** @ignore **/
function sendDeliveryStatusSuccess(recipient: { gatewayWindow: Window; origin: string } | Client, destination: { transport: MessagingTransport, topic: string }): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination.transport, {
    topic: destination.topic,
    body: {ok: true},
    headers: new Map(),
  });
}

/** @ignore **/
function sendDeliveryStatusError(recipient: { gatewayWindow: Window; origin: string } | Client, destination: { transport: MessagingTransport, topic: string }, error: string): void {
  sendTopicMessage<MessageDeliveryStatus>(recipient, destination.transport, {
    topic: destination.topic,
    body: {ok: false, details: error},
    headers: new Map(),
  });
}

/** @ignore **/
function sendTopicMessage<T>(recipient: { gatewayWindow: Window; origin: string } | Client, transport: MessagingTransport, message: TopicMessage<T>): void {
  const envelope: MessageEnvelope<TopicMessage<T>> = {
    transport: transport,
    channel: MessagingChannel.Topic,
    message: {...message},
  };

  envelope.message.params = new Map(envelope.message.params || new Map());
  envelope.message.headers = new Map(envelope.message.headers || new Map());

  const headers = envelope.message.headers;
  if (!headers.has(MessageHeaders.MessageId)) {
    headers.set(MessageHeaders.MessageId, UUID.randomUUID());
  }
  if (!headers.has(MessageHeaders.AppSymbolicName)) {
    headers.set(MessageHeaders.AppSymbolicName, PLATFORM_SYMBOLIC_NAME);
  }

  const target = recipient instanceof Client ? {gatewayWindow: recipient.gatewayWindow, origin: recipient.application.origin} : recipient;
  target.gatewayWindow.postMessage(envelope, target.origin);
}

/**
 * Represents a message send by a client connected to the message broker.
 *
 * @ignore
 */
interface ClientMessage<MSG extends Message = any> {
  envelope: MessageEnvelope<MSG>;
  client: Client;
}

/**
 * Catches and logs errors, and resubscribes to the source observable.
 *
 * @ignore
 */
function catchErrorAndRetry<T>(): MonoTypeOperatorFunction<T> {
  return catchError((error, caught) => {
    Beans.get(Logger).error('[UnexpectedError] An unexpected error occurred.', error);
    return caught;
  });
}
