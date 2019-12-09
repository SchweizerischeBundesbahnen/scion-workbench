import { Qualifier } from './platform.model';

/**
 * Represents a message with headers to transport additional information with a message.
 */
export interface Message {
  /**
   * Additional information attached to this message.
   *
   * Header values must be JSON serializable. If no headers are set, the {@link Map} is empty.
   */
  headers: Map<string, any>;
}

/**
 * Represents an intent issued by an application.
 *
 * The intent is transported to all clients that provide a satisfying capability visible to the issuing application.
 */
export interface IntentMessage<BODY = any> extends Message {
  /**
   * Type of functionality which to intent.
   */
  type: string;
  /**
   * Dictionary of key-value pairs to express the intent.
   */
  qualifier?: Qualifier;
  /**
   * Optional JSON serializable data to pass with the intent.
   */
  body?: BODY;
}

/**
 * Represents a message published to a topic.
 *
 * The message is transported to all consumers subscribed to the topic.
 */
export interface TopicMessage<BODY = any> extends Message {
  /**
   * The topic where to publish this message to.
   */
  topic: string;
  /**
   * Instructs the broker to store this message as retained message for the topic. With the retained flag set to `true`,
   * a client receives this message immediately upon subscription. The broker stores only one retained message per topic.
   * To delete the retained message, send a retained message without a body to the topic.
   */
  retain?: boolean;
  /**
   * Optional JSON serializable data.
   */
  body?: BODY;
}

/**
 * Declares headers set by the platform when sending a message.
 *
 * Clients are allowed to read platform defined headers from a message.
 */
export enum MessageHeaders {
  /**
   * Identifies the sending client instance of a message.
   */
  ClientId = 'ɵClientId',
  /**
   * Identifies the sending application of a message.
   */
  AppSymbolicName = 'ɵAppSymbolicName',
  /**
   * Destination to which to send a response to this message.
   *
   * This header is set by the platform if the publisher expects the consumer to reply to the message.
   */
  ReplyTo = 'ɵReplyTo',
}
