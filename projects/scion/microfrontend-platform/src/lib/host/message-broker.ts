import { asapScheduler, fromEvent, MonoTypeOperatorFunction, Observable, OperatorFunction, Subject } from 'rxjs';
import { filter, first, map, share, startWith, takeUntil } from 'rxjs/operators';
import { Application } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { ClientConnectCommand, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { matchesCapabilityQualifier } from '../qualifier-tester';
import { Beans, PreDestroy } from '../bean-manager';
import { ApplicationRegistry } from './application.registry';
import { ManifestRegistry } from './manifest.registry';
import { UUID } from '@scion/toolkit/util';

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
        filter(event => {
          const envelope: MessageEnvelope = event.data;
          return envelope.channel !== MessagingChannel.ClientConnect; // exclude connect requests as handled separately
        }),
        checkMessageOrigin(this._clientRegistry),
        mapToClientMessage(this._clientRegistry),
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

    // reply to requests observing subscriptions of a topic.
    this.installTopicSubscriberCountObserver();
  }

  /**
   * Listens for client connnect requests.
   */
  private installClientConnectListener(): void {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterMessage(MessagingTransport.ClientToBroker, MessagingChannel.ClientConnect),
        takeUntil(this._destroy$),
      )
      .subscribe((event: MessageEvent) => {
        const envelope: MessageEnvelope<ClientConnectCommand> = event.data;
        const clientWindow = event.source as Window;
        const clientAppName = envelope.message.symbolicAppName;

        const messageId = envelope.messageId;
        const messageSource = {window: clientWindow, origin: event.origin};

        if (!clientAppName) {
          const error = {type: 'MessageClientConnectError', details: `Connect request rejected: 'symbolicAppName' not provided [origin=${event.origin}]`};
          sendError(messageSource, messageId, error);
          return;
        }

        const application = this._applicationRegistry.getApplication(clientAppName);
        if (!application) {
          const error = {type: 'MessageClientConnectError', details: `Connect request rejected: Application not registered [application=${clientAppName}]`};
          sendError(messageSource, messageId, error);
          return;
        }

        if (event.origin !== application.origin) {
          const error = {type: 'MessageClientConnectError', details: `Connect request blocked: Wrong origin [actual=${event.origin}, expected=${application.origin}, application=${application.symbolicName}]`};
          sendError(messageSource, messageId, error);
          return;
        }

        const client: Client = {application: application, window: clientWindow, origin: event.origin};
        this.disconnect(client);
        this._clientRegistry.set(clientWindow, client);
        sendSuccess(messageSource, messageId);
      });
  }

  /**
   * Listens for client disconnect requests.
   */
  private installClientDisconnectListener(): void {
    this._clientRequests$
      .pipe(
        filterByChannel(MessagingChannel.ClientDisconnect),
        takeUntil(this._destroy$),
      )
      .subscribe((clientMessage: ClientMessage<void>) => {
        this.disconnect(clientMessage.client);
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
          sendError(client, envelope.messageId, error);
          return;
        }

        const clients = this._clientsByTopicMap.get(topic) || new Set<Client>();
        this._clientsByTopicMap.set(topic, clients.add(client));
        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendSuccess(client, envelope.messageId);
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
          sendError(client, envelope.messageId, error);
          return;
        }

        const clients = this._clientsByTopicMap.get(topic) || new Set<Client>();
        if (clients.delete(clientMessage.client) && clients.size === 0) {
          this._clientsByTopicMap.delete(topic);
        }

        this._topicSubscriberChange$.next({topic, subscriptionCount: clients.size});
        sendSuccess(client, envelope.messageId);
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
        sendSuccess(client, clientMessage.envelope.messageId);

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
        filter(clientMessage => clientMessage.envelope.message.topic !== PlatformTopics.SubscriberCount),
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
          sendError(clientMessage.client, envelope.messageId, {type: 'RequestReplyError', details: `No replier found to reply to requests published to topic '${envelope.message.topic}'.`});
        }
        else {
          sendSuccess(clientMessage.client, envelope.messageId);
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
          sendError(senderClient, envelope.messageId, error);
          return;
        }

        if (!intent.type) {
          const error = {type: 'IntentDispatchError', details: 'Intent type required'};
          sendError(senderClient, envelope.messageId, error);
          return;
        }

        if (!this._manifestRegistry.hasIntent(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NotQualifiedError', details: `Application '${senderClient.application.symbolicName}' is not qualified to publish intents of the type '${intent.type}' and qualifier '${JSON.stringify(intent.qualifier || {})}'. Ensure to have listed the intent in the application manifest.`};
          sendError(senderClient, envelope.messageId, error);
          return;
        }

        if (!this._manifestRegistry.isHandled(senderClient.application.symbolicName, intent.type, intent.qualifier)) {
          const error = {type: 'NullCapabilityProviderError', details: `No application found to provide a capability of the type '${intent.type}' and qualifiers '${JSON.stringify(intent.qualifier || {})}'. Maybe, the capability is not public API or the providing application not available.`};
          sendError(senderClient, envelope.messageId, error);
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
          sendError(clientMessage.client, envelope.messageId, {type: 'RequestReplyError', details: `No replier found to reply to intent '{type=${envelope.message.type}, qualifier=${JSON.stringify(envelope.message.qualifier)}}'.`});
        }
        else {
          sendSuccess(clientMessage.client, envelope.messageId);
        }
      });
  }

  private disconnect(client: Client): void {
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
 * Returns a filter which passes all messages that originate from registered clients.
 */
function checkMessageOrigin(clientRegistry: ClientRegistry): MonoTypeOperatorFunction<MessageEvent> {
  return filter((event: MessageEvent): boolean => {
    const senderClientWindow = event.source as Window;
    const senderClient = clientRegistry.get(senderClientWindow);
    const envelope: MessageEnvelope = event.data;

    if (!senderClient) {
      const target = {window: senderClientWindow, origin: event.origin};
      const error = {type: 'MessageDispatchError', details: `Message rejected: Client not registered [origin=${event.origin}]`};
      sendError(target, envelope.messageId, error);
      return false;
    }

    if (event.origin !== senderClient.application.origin) {
      const target = {window: senderClientWindow, origin: event.origin};
      const error = {type: 'MessageDispatchError', details: `Message rejected: Wrong origin [actual=${event.origin}, expected=${senderClient.application.origin}, application=${senderClient.application.symbolicName}]`};
      sendError(target, envelope.messageId, error);
      return false;
    }

    return true;
  });
}

function mapToClientMessage<T>(clientRegistry: ClientRegistry): OperatorFunction<MessageEvent, ClientMessage<T>> {
  return map((event: MessageEvent): ClientMessage<T> => {
    return {
      envelope: event.data as MessageEnvelope<T>,
      client: clientRegistry.get(event.source as Window),
    };
  });
}

export function filterByTopic(topic: string): MonoTypeOperatorFunction<ClientMessage<TopicMessage>> {
  return filter((clientMessage: ClientMessage<TopicMessage>): boolean => {
    return clientMessage.envelope.message.topic === topic;
  });
}

function sendSuccess(target: { window: Window; origin: string }, topic: string): void {
  const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = {
    messageId: UUID.randomUUID(),
    transport: MessagingTransport.BrokerToClient,
    channel: MessagingChannel.Topic,
    message: {
      topic: topic,
      payload: {success: true},
    },
  };
  target.window.postMessage(envelope, target.origin);
}

function sendError(target: { window: Window; origin: string }, topic: string, error: { type: string; details: string }): void {
  const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = {
    messageId: UUID.randomUUID(),
    transport: MessagingTransport.BrokerToClient,
    channel: MessagingChannel.Topic,
    message: {
      topic: topic,
      payload: {
        success: false,
        details: `[${error.type}] ${error.details}`,
      },
    },
  };
  target.window.postMessage(envelope, target.origin);
}

/**
 * Represents an application instance which is connected to the message broker.
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

interface TopicSubscriberChangeEvent {
  topic: string;
  subscriptionCount: number;
}
