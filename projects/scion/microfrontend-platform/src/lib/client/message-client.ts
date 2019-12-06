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
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { Intent } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { first, takeUntil } from 'rxjs/operators';
import { Beans } from '../bean-manager';

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
 */
export abstract class MessageClient {

  /**
   * Publishes a message to the given topic. The message is transported to all consumers subscribed to the topic.
   *
   * @param  topic
   *         Specifies the topic destination of the message.
   * @param  message
   *         Specifies transfer data to be sent to the destination, if any.
   * @return An Observable which completes immediately when dispatched the message, or which throws an error if the message
   *         could not be dispatched.
   */
  abstract publish$(topic: string, message?: any): Observable<never>;

  /**
   * Sends a request to the given topic and receives one or more replies.
   *
   * @param  topic
   *         Specifies the topic destination of the message.
   * @param  message
   *         Specifies transfer data to be sent to the destination, if any.
   * @return An Observable that emits when receiving a reply. It never completes. It throws an error if the message could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract request$<T>(topic: string, message?: any): Observable<TopicMessage<T>>;

  /**
   * Receives messages published to the given topic.
   *
   * If the received message has the `replyTo` field set, the publisher expects the receiver to send one or more replies to that `replyTo` topic.
   * If replying with data from a stream, you can use {@link takeUntilUnsubscribe} operator to stop replying when the requestor unsubscribes.
   *
   * ### Reply example:
   *
   * ```
   * Beans.get(MessageClient).observe$('topic').subscribe(request => {
   *   stream$
   *     .pipe(
   *       mergeMap(data => Beans.get(MessageClient).publish$(request.replyTo, data)),
   *       takeUntilUnsubscribe(request.replyTo),
   *     )
   *     .subscribe();
   * });
   * ```
   *
   * @param  topic
   *         Specifies the topic which to observe.
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
   * @param  payload
   *         Specifies transfer data to be carried with the intent, if any.
   * @return An Observable which completes immediately when dispatched the intent, or which throws an error if the intent
   *         could not be dispatched, e.g., because if missing the intent, or because if no application is found to handle
   *         the intent.
   */
  abstract issueIntent$(intent: Intent, payload?: any): Observable<never>;

  /**
   * Issues an intent and receives one or more replies.
   *
   * The intent is transported to all clients that provide a satisfying capability visible to this application.
   *
   * The issuing application must declare the intent in its manifest, otherwise the intent is rejected.
   *
   * @param  intent
   *         Describes the intent. The qualifier must not contain wildcard characters.
   * @param  payload
   *         Specifies transfer data to be carried with the intent, if any.
   * @return An Observable that emits when receiving a reply. It never completes. It throws an error if the intent could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract requestByIntent$<T>(intent: Intent, payload?: any): Observable<TopicMessage<T>>;

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
   *   authToken$
   *     .pipe(
   *       mergeMap(token => Beans.get(MessageClient).publish$(request.replyTo, token)),
   *       takeUntilUnsubscribe(request.replyTo),
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
   * Allows observing the subscriptions on a topic.
   *
   * @param  topic
   *         Specifies the topic which to observe its subscribers.
   * @return An Observable that, when subscribed, emits the current number of subscribers on this topic. It never completes and
   *         emits continuously when the number of subscribers changes.
   */
  abstract subscriberCount$(topic: string): Observable<number>;
}

/**
 * Emits the values emitted by the source Observable until all consumers unsubscribe from the given topic. Then, it completes.
 */
export function takeUntilUnsubscribe<T>(topic: string): MonoTypeOperatorFunction<T[]> {
  return takeUntil(Beans.get(MessageClient).subscriberCount$(topic).pipe(first(count => count === 0)));
}
