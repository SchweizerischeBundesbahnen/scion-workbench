import { Qualifier } from './platform.model';

/**
 * Represents an intent issued by an application.
 *
 * The intent is transported to all subscribed consumers capable handling the intent,
 * i.e., providing a capability which fulfills the intent, and which is visible to the sending application.
 */
export interface IntentMessage<T = any> {
  /**
   * Type of functionality which to intent.
   */
  type: string;
  /**
   * Dictionary of key-value pairs to express the intent.
   */
  qualifier?: Qualifier;
  /**
   * Optional intent payload.
   */
  payload?: T;
  /**
   * Topic where a reply to the current message should be sent. This field is only set if the publisher
   * expects the consumer to reply. However, a reply is optional; it is up to the client to decide.
   */
  replyTo?: string;
}

/**
 * Represents a message published to a topic.
 *
 * The message is transported to all consumers subscribed to the topic.
 */
export interface TopicMessage<T = any> {
  /**
   * The topic where to publish this message to.
   */
  topic: string;
  /**
   * Optional message payload.
   */
  payload?: T;
  /**
   * Topic where a reply to the current message should be sent. This field is only set if the publisher
   * expects the consumer to reply. However, a reply is optional; it is up to the client to decide.
   */
  replyTo?: string;
}
