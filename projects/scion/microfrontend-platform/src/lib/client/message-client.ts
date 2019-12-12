/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
// tslint:disable:unified-signatures
import { MonoTypeOperatorFunction, NEVER, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { Intent, IntentMessage, MessageHeaders, ResponseStatusCodes, TopicMessage } from '../messaging.model';
import { first, map, mergeMap, takeUntil } from 'rxjs/operators';
import { AbstractType, Beans, Type } from '../bean-manager';

/**
 * The message client allows sending and receiving messages between applications across origins.
 *
 * The client provides topic-based (pub/sub) and intent-based messaging and supports one-way
 * and two-way communication (also known as request-response message exchange pattern).
 *
 * ## Topic-based messaging
 * Allows publishing a message to multiple consumers subscribed to a topic.
 *
 * ## Intent-based messaging
 * Requires the publisher to declare an intent and some application to provide a capability.
 * The intent is transported to all clients that provide a satisfying capability visible to
 * the sending application.
 *
 * ### Wildcards
 * A subscriber can subscribe to multiple topics simultaneously by using the colon syntax.
 * If a topic segment begins with a colon (:), then the segment acts as a placeholder for any value.
 * For example, subscribing to the topic 'person/:id' receives messages published to the topics 'person/5' and
 * 'person/6'. Substituted segment values are available in the params map on the received message.
 *
 * ### Retained messages
 * Messages published to a topic can be marked as 'retained'. Retained messages help newly-subscribed
 * clients to immediately get the last message published to that topic. The broker stores one retained
 * message per topic. To delete a retained message, send a retained message without a body to the topic.
 */
export abstract class MessageClient {

  /**
   * Publishes a message to the given topic. The message is transported to all consumers subscribed to the topic.
   *
   * When publishing a retained message that has no or an 'undefined' payload, the broker deletes the retained message
   * and does not dispatch it.
   *
   * @param  topic
   *         Specifies the topic to which the message should be sent.
   *         Topics are case-sensitive and consist of one or more segments each separated by a forward slash.
   *         The topic is required and does not allow to use wildcards.
   * @param  message
   *         Specifies transfer data to be sent to the destination, if any.
   * @param  options
   *         Controls how to publish the message and allows setting message headers.
   * @return An Observable which completes immediately when dispatched the message, or which throws an error if the message
   *         could not be dispatched.
   */
  abstract publish$<T = any>(topic: string, message?: T, options?: PublishOptions): Observable<never>;

  /**
   * Sends a request to the given topic and receives one or more replies.
   *
   * @param  topic
   *         Specifies the topic to which the requst should be sent.
   *         Topics are case-sensitive and consist of one or more segments each separated by a forward slash.
   *         The topic is required and does not allow to use wildcards.
   * @param  request
   *         Specifies transfer data to be sent to the destination, if any.
   * @param  options
   *         Controls how to send the request and allows setting request headers.
   * @return An Observable that emits when receiving a reply. It never completes. It throws an error if the message could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract request$<T>(topic: string, request?: any, options?: MessageOptions): Observable<TopicMessage<T>>;

  /**
   * Receives messages published to the given topic.
   *
   * If the received message has the `replyTo` field set, the publisher expects the receiver to send one or more replies to that `replyTo` topic.
   * If replying with data from a stream, you can use {@link takeUntilUnsubscribe} operator to stop replying when the requestor unsubscribes.
   *
   *
   * ### Example with a named parameter segment:
   *
   * ```
   * Beans.get(MessageClient).observe$('person/:id').subscribe(message => {
   *   const personId = message.params.get('id');
   *   ...
   * });
   * ```
   *
   * ### Reply example:
   *
   * ```
   * Beans.get(MessageClient).observe$('topic').subscribe(request => {
   *   const replyTo = request.headers.get(MessageHeaders.ReplyTo);
   *   stream$
   *     .pipe(
   *       mergeMap(data => Beans.get(MessageClient).publish$(replyTo, data)),
   *       takeUntilUnsubscribe(replyTo)),
   *     )
   *     .subscribe();
   * });
   * ```
   *
   * @param  topic
   *         Specifies the topic which to observe.
   *         Topics are case-sensitive and consist of one or more segments each separated by a forward slash.
   *         You can subscribe to the exact topic of a published message, or use wildcards to subscribe to multiple
   *         topics simultaneously. If a segment begins with a colon (:), then the segment acts as a placeholder for any
   *         string value. When receiving a message, the actual placeholder values can then be read using the
   *         {@link TopicMessage#params} property on the received message.
   * @return An Observable that emits messages sent to the given topic. It never completes.
   */
  abstract observe$<T>(topic: string): Observable<TopicMessage<T>>;

  /**
   * Issues an intent. The intent is transported to all clients that provide a satisfying capability visible to this application.
   *
   * The issuing application must declare the intent in its manifest, otherwise the intent is rejected.
   *
   * @param  intent
   *         Describes the intent. It must not contain wildcard characters.
   * @param  body
   *         Specifies transfer data to be carried with the intent, if any.
   *         It can be any object which is serializable with the structured clone algorithm.
   * @param  options
   *         Controls how to issue the intent and allows setting message headers.
   * @return An Observable which completes immediately when dispatched the intent, or which throws an error if the intent
   *         could not be dispatched, e.g., because if missing the intent, or because if no application is found to handle
   *         the intent.
   */
  abstract issueIntent$<T = any>(intent: Intent, body?: T, options?: MessageOptions): Observable<never>;

  /**
   * Issues an intent and receives one or more replies.
   *
   * The intent is transported to all clients that provide a satisfying capability visible to this application.
   *
   * The issuing application must declare the intent in its manifest, otherwise the intent is rejected.
   *
   * @param  intent
   *         Describes the intent. The qualifier must not contain wildcard characters.
   * @param  body
   *         Specifies transfer data to be carried with the intent, if any.
   *         It can be any object which is serializable with the structured clone algorithm.
   * @param  options
   *         Controls how to send the request and allows setting request headers.
   * @return An Observable that emits when receiving a reply. It never completes. It throws an error if the intent could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract requestByIntent$<T>(intent: Intent, body?: any, options?: MessageOptions): Observable<TopicMessage<T>>;

  /**
   * Receives intents when some application intends to use some capability of this application.
   *
   * Note that only those intents are received for which this application provides a satisfying capability.
   * You can provide a selector to filter intents. The selector allows using wildcard characters in the qualifier.
   *
   * If the received intent has the `replyTo` field set, the publisher expects the receiver to send one or more replies to that `replyTo` topic.
   * If replying with data from a stream, you can use {@link takeUntilUnsubscribe} operator to stop replying when the requestor unsubscribes.
   *
   * ### Reply example:
   *
   * ```
   * Beans.get(MessageClient).handleIntent$({type: 'auth-token'}).subscribe(request => {
   *   const replyTo = request.headers.get(MessageHeaders.ReplyTo);
   *   authToken$
   *     .pipe(
   *       mergeMap(token => Beans.get(MessageClient).publish$(replyTo, token)),
   *       takeUntilUnsubscribe(replyTo),
   *     )
   *     .subscribe();
   * });
   * ```
   *
   * @param  selector
   *         Allows filtering intents. Following wildcard characters are supported in the qualifier:
   *         - Asterisk wildcard character ('*'):
   *           Can be used as qualifier key or as qualifier value.
   *           If used as qualifier key, the selector also matches intents which contain additional qualifier entries not specified in the selector.
   *           If used as qualifier value, the selector matches intents which contain such a qualifier entry, but with any value allowed (except for `null` or `undefined` values).
   *         - Optional wildcard character ('?'):
   *           Is allowed as a qualifier value only and means that this entry is optional.
   * @return An Observable that emits intents for which this application provides a satisfying capability. It never completes.
   */
  abstract handleIntent$<T>(selector?: Intent): Observable<IntentMessage<T>>;

  /**
   * Allows observing the number of subscriptions on a topic.
   *
   * @param  topic
   *         Specifies the topic to observe. It is not allowed to use wildcards in the topic to observe.
   * @return An Observable that, when subscribed, emits the current number of subscribers on it. It never completes and
   *         emits continuously when the number of subscribers changes.
   */
  abstract subscriberCount$(topic: string): Observable<number>;

  /**
   * Returns whether this client is connected to the message broker.
   */
  abstract isConnected(): Promise<boolean>;
}

/**
 * Emits the values emitted by the source Observable until all consumers unsubscribe from the given topic. Then, it completes.
 */
export function takeUntilUnsubscribe<T>(topic: string, /* @internal */ messageClientType?: Type<MessageClient> | AbstractType<MessageClient>): MonoTypeOperatorFunction<T> {
  return takeUntil(Beans.get(messageClientType || MessageClient).subscriberCount$(topic).pipe(first(count => count === 0)));
}

/**
 * Maps each message to its body.
 */
export function mapToBody<T>(): OperatorFunction<TopicMessage<T> | IntentMessage<T>, T> {
  return map(message => message.body);
}

/**
 * Returns an Observable that mirrors the source Observable, unless receiving a message with
 * a status code other than {@link ResponseStatusCodes#OK}. Then, the stream will end with an
 * error and source Observable will be unsubscribed.
 */
export function throwOnErrorStatus<BODY>(): MonoTypeOperatorFunction<TopicMessage<BODY>> {
  return mergeMap((message: TopicMessage<BODY>): Observable<TopicMessage<BODY>> => {
    const status = message.headers.get(MessageHeaders.Status) || ResponseStatusCodes.ERROR;
    if (status === ResponseStatusCodes.OK) {
      return of(message);
    }

    if (message.body) {
      return throwError(`[${status}] ${message.body}`);
    }

    switch (status) {
      case ResponseStatusCodes.BAD_REQUEST: {
        return throwError(`${status}: The receiver could not understand the request due to invalid syntax.`);
      }
      case ResponseStatusCodes.NOT_FOUND: {
        return throwError(`${status}: The receiver could not find the requested resource.`);
      }
      case ResponseStatusCodes.ERROR: {
        return throwError(`${status}: The receiver encountered an internal error.`);
      }
      default: {
        return throwError(`${status}: Request error.`);
      }
    }
  });
}

/**
 * Control how to publish the message.
 */
export interface PublishOptions extends MessageOptions {
  /**
   * Instructs the broker to store this message as retained message for the topic. With the retained flag set to `true`,
   * a client receives this message immediately upon subscription. The broker stores only one retained message per topic.
   * To delete the retained message, send a retained message without a body to the topic.
   */
  retain?: boolean;
}

/**
 * Control how to publish a message.
 */
export interface MessageOptions {
  /**
   * Sets headers to pass additional information with a message.
   */
  headers?: Map<string, any>;
}

/**
 * Message client that does nothing.
 */
export class NullMessageClient implements MessageClient {

  public constructor() {
    console.log('[NullMessageClient] Using \'NullMessageClient\' for messaging. Messages cannot be sent or received.');
  }

  public publish$<T = any>(topic: string, message?: T, options?: PublishOptions): Observable<never> {
    return NEVER;
  }

  public request$<T>(topic: string, request?: any, options?: MessageOptions): Observable<TopicMessage<T>> {
    return NEVER;
  }

  public observe$<T>(topic: string): Observable<TopicMessage<T>> {
    return NEVER;
  }

  public issueIntent$<T = any>(intent: Intent, body?: T, options?: MessageOptions): Observable<never> {
    return NEVER;
  }

  public requestByIntent$<T>(intent: Intent, body?: any, options?: MessageOptions): Observable<TopicMessage<T>> {
    return NEVER;
  }

  public handleIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
    return NEVER;
  }

  public subscriberCount$(topic: string): Observable<number> {
    return NEVER;
  }

  public isConnected(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
