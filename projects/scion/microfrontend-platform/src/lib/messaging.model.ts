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
 * An intent is the message that is passed to interact with functionality available in the system. An application must
 * declare all its intents in the application manifest in the form of intentions. Otherwise, intents are rejected when
 * issued. The enforced declaration allows to analyze which components depend on which functionality in the system.
 *
 * An intention or intent is formulated in an abstract way and consists of a type and an optional qualifier. When a
 * component intends to use some functionality, it issues a respective intent.
 */
export interface Intent {
  /**
   * Type of functionality to intend.
   */
  type: string;
  /**
   * The qualifier is an abstract description of the intent and is expressed in the form of a dictionary.
   *
   * When issuing an intent, the qualifier must be exact, i.e. not contain wildcards.
   */
  qualifier?: Qualifier;
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
   * Optional JSON serializable data.
   */
  body?: BODY;
  /**
   * Instructs the broker to store this message as retained message for the topic. With the retained flag set to `true`,
   * a client receives this message immediately upon subscription. The broker stores only one retained message per topic.
   * To delete the retained message, send a retained message without a body to the topic.
   */
  retain?: boolean;
  /**
   * Contains the resolved values of the wildcard segments as specified in the topic.
   * For example: If subscribed to the topic 'person/:id' and a message is published to the topic 'person/5',
   * the resolved id with the value '5' is contained in the params map.
   */
  params?: Map<string, string>;
}

/**
 * Declares headers set by the platform when sending a message.
 *
 * Clients are allowed to read platform defined headers from a message.
 */
export enum MessageHeaders {
  /**
   * Identifies the sending client instance of a message.
   * This header is set by the platform when publishing a message or intent.
   */
  ClientId = 'ɵCLIENT_ID',
  /**
   * Identifies the sending application of a message.
   * This header is set by the platform when publishing a message or intent.
   */
  AppSymbolicName = 'ɵAPP_SYMBOLIC_NAME',
  /**
   * Unique identity of the message.
   * This header is set by the platform when publishing a message or intent.
   */
  MessageId = 'ɵMESSAGE_ID',
  /**
   * Destination to which to send a response to this message.
   * This header is set by the platform when sending a request.
   */
  ReplyTo = 'ɵREPLY_TO',
  /**
   * The time the message was sent.
   * This header is set by the platform when publishing a message or intent.
   */
  Timestamp = 'ɵTIMESTAMP',
  /**
   * Use this header to set the request method to indicate the desired action to be performed for a given resource.
   * @see RequestMethods
   */
  Method = 'ɵMETHOD',
  /**
   * Use this header to set the response status code to indicate whether a request has been successfully completed.
   * @see ResponseStatusCodes
   */
  Status = 'ɵSTATUS',
  /**
   * Unique identity of a topic subscriber.
   *
   * @internal
   */
  ɵTopicSubscriberId = 'ɵTOPIC_SUBSCRIBER_ID',
}

/**
 * Defines a set of request methods to indicate the desired action to be performed for a given resource.
 */
export enum RequestMethods {
  /**
   * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
   */
  GET = 'GET',
  /**
   * The DELETE method deletes the specified resource.
   */
  DELETE = 'DELETE',
  /**
   * The PUT method replaces all current representations of the target resource with the request payload.
   */
  PUT = 'PUT',
  /**
   * The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
   */
  POST = 'POST',
  /**
   * The OBSERVE method is used to observe the specified resource.
   */
  OBSERVE = 'OBSERVE'
}

/**
 * Defines a set of response status codes to indicate whether a request has been successfully completed.
 */
export enum ResponseStatusCodes {
  /**
   * The request has succeeded.
   */
  OK = 200,
  /**
   * The receiver could not understand the request due to invalid syntax.
   */
  BAD_REQUEST = 400,
  /**
   * The receiver could not find the requested resource.
   */
  NOT_FOUND = 404,
  /**
   * The receiver encountered an internal error. The error is transmitted in the message body.
   */
  ERROR = 500,
}

