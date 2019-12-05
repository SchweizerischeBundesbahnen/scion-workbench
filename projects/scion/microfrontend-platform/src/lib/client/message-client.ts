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
 * The client provides topic-based (publish/subscribe) and intent-based messaging, and allows consumers
 * to reply to a message.
 *
 * ### Topic-based Messaging:
 * Allows publishing a message to multiple consumers subscribed to a topic.
 *
 * ### Intent-based Messaging:
 * Requires the publisher to declare an intent and some application to provide a capability. The intent is transported
 * to all consumers capable of handling the intent, i.e., providing a capability fulfilling the intent and which is
 * visible to the publishing application.
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
   * Issues an intent of the given type and qualifier, if any. The intent is transported to all consumers capable of
   * handling the intent, i.e., providing a capability fulfilling the intent and which is visible to the publishing
   * application.
   *
   * Publishing an intent requires the publisher declaring the intent in its application manifest.
   *
   * @param  intent
   *         Describes the intent. It must not include wildcard characters.
   * @param  payload
   *         Specifies transfer data to be sent with the intent, if any.
   * @return An Observable which completes immediately when dispatched the message, or which throws an error if the message
   *         could not be dispatched, e.g., because if missing the intent, or because if no application is found to handle
   *         the intent.
   */
  abstract publish$(intent: Intent, payload?: any): Observable<never>;

  /**
   * Initiates a 'request-reply' communication with consumer(s) subscribed to the given topic.
   *
   * @param  topic
   *         Specifies the topic destination of the message.
   * @param  message
   *         Specifies transfer data to be sent to the destination, if any.
   * @return An Observable that emits when some consumer replies. It never completes. It throws an error if the message could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract requestReply$<T>(topic: string, message?: any): Observable<TopicMessage<T>>;

  /**
   * Initiates a 'request-reply' communication with consumer(s) capable of handling the given intent, i.e.,
   * providing a capability fulfilling the intent and which is visible to the publishing application.
   *
   * Publishing an intent requires the publisher declaring the intent in its application manifest.
   *
   * @param  intent
   *         Describes the intent. The qualifier must not include wildcard characters.
   * @param  payload
   *         Specifies transfer data to be sent with the intent, if any.
   * @return An Observable that emits when some consumer replies. It never completes. It throws an error if the message could not be dispatched.
   *         If expecting a single reply, use {@link take(1)} operator to unsubscribe upon the receipt of the first reply.
   */
  abstract requestReply$<T>(intent: Intent, payload?: any): Observable<TopicMessage<T>>;

  /**
   * Receives messages published to the given topic.
   *
   * If the received message has the `replyTo` field set, the publisher expects to send some reply(ies) to that `replyTo` topic.
   * If replying with data from some long-living Observable, you can track the requestor's subscription by monitoring {@link MessageClient#subscriberCount$}.
   * You can use {@link takeUntilUnsubscribe} operator to stop replying when the requestor unsubscribes.
   *
   * ### Request-Reply example monitoring the requestor's subscription:
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
   * Receives intents when some application intends to use some capability of this application.
   *
   * Note that only those intents are received for which this application declares a fulfilling capability.
   * You can provide a selector to filter intents. The selector allows using wildcard characters in the qualifier.
   *
   * If the received intent has the `replyTo` field set, the issuer expects the provider to send some reply(ies) to that `replyTo` topic.
   * If replying with data from some long-living Observable, the provider can track the requestor's subscription by monitoring {@link MessageClient#subscriberCount$}.
   * When the subscription count drops to zero, the requestor unsubscribed, meaning that the provider can stop replying.
   *
   *
   * ### Request-Reply example monitoring the requestor's subscription:
   *
   * ```
   * Beans.get(MessageClient).observe$({type: 'auth-token'}).subscribe(request => {
   *   authToken$
   *     .pipe(
   *       mergeMap(data => Beans.get(MessageClient).publish$(request.replyTo, authToken)),
   *       takeUntilUnsubscribe(request.replyTo),
   *     )
   *     .subscribe();
   * });
   * ```
   *
   * @param  selector
   *         Allows filtering intents. Note that only those intents are received for which this application declares a fulfilling capability.
   *         The selector allows using wildcard characters in the qualifier:
   *         - The asterisk wildcard character (*) can be used as a qualifier key or qualifier value. If used as a qualifier key, the intent
   *           may include additional qualifier entries not specified in the selector. If used as qualifier value, the intent must declare
   *           a respective qualifier entry, but allows any value (except `null` or `undefined`) as its qualifier value.
   *         - The optional qualifier entry wildcard character (?) is allowed as a qualifier value only, and means, that the presence of that
   *           qualifier entry is optional.
   * @return An Observable that emits intents for which this application declares a fulfilling capability. It never completes.
   */
  abstract observe$<T>(selector?: Intent): Observable<IntentMessage<T>>;

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
 * Emits the values emitted by the source Observable until all subscribers unsubscribe from the given topic.
 *
 * Use this method as `takeUntil` operator when replying to a message.
 */
export function takeUntilUnsubscribe<T>(topic: string): MonoTypeOperatorFunction<T[]> {
  return takeUntil(Beans.get(MessageClient).subscriberCount$(topic).pipe(first(count => count === 0)));
}
