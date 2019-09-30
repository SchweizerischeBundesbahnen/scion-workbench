import { IntentMessage, TopicMessage } from './messaging.model';

/**
 * Declares the message transports.
 */
export enum MessagingTransport {
  /**
   * Transport used by clients to communicate with the broker.
   */
  ClientToBroker = 'sci://microfrontend-platform/client-to-broker',
  /**
   * Transport used by the broker to communicate with its clients.
   */
  BrokerToClient = 'sci://microfrontend-platform/broker-to-client',
}

/**
 * Defines the channels to which messages can be sent.
 */
export enum MessagingChannel {
  ClientConnect = 'client-connect',
  ClientDisconnect = 'client-disconnect',
  TopicSubscribe = 'topic-subscribe',
  TopicUnsubscribe = 'topic-unsubscribe',
  Intent = 'intent',
  Topic = 'topic',
}

/**
 * Envelope for all messages sent over the message bus.
 */
export interface MessageEnvelope<Message = IntentMessage | TopicMessage | ClientConnectCommand | TopicSubscribeCommand | TopicUnsubscribeCommand> {
  messageId: string;
  transport: MessagingTransport;
  channel: MessagingChannel;
  message?: Message;
}

/**
 * Declares internal platform topics.
 */
export enum PlatformTopics {
  /**
   * Send a request-reply request to this topic to observe the number of subscribers subscribed to the topic in the message payload.
   */
  SubscriberCount = 'ɵtopic-subscriber-count'
}

export interface ClientConnectCommand {
  symbolicAppName: string;
}

export interface TopicSubscribeCommand {
  topic: string;
}

export interface TopicUnsubscribeCommand {
  topic: string;
}

export interface MessageDeliveryStatus {
  success: boolean;
  details?: string;
}
