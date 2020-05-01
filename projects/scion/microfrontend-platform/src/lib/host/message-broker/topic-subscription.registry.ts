/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Defined } from '@scion/toolkit/util';
import { TopicMatcher } from '../../topic-matcher.util';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { Client } from './client.registry';

/**
 * Central point for managing topic subscriptions.
 *
 * @ignore
 */
export class TopicSubscriptionRegistry {

  private readonly _subscriptionRegistry = new Map<string, TopicSubscription>();
  private readonly _subscriptionChange$ = new Subject<SubscriptionChangeEvent>();

  /**
   * Subscribes the subscriber of given identity to receive messages sent to the given topic.
   *
   * After calling this method, messages that are published on that topic are transported to the
   * subscribing client until {@link unsubscribe} or {@link unsubscribeClient} is called.
   *
   * @param topic - The topic which to observe; it allows using wildcard segments, e.g., `person/:id`.
   * @param client - The client which subscribes to the topic.
   * @param subscriberId - Unique identify of the subscriber.
   */
  public subscribe(topic: string, client: Client, subscriberId: string): void {
    Defined.orElseThrow(subscriberId, () => Error('[TopicSubscribeError] SubscriberId required'));
    Defined.orElseThrow(topic, () => Error('[TopicSubscribeError] Topic required'));
    Defined.orElseThrow(client, () => Error('[TopicSubscribeError] Client required'));

    this._subscriptionRegistry.set(subscriberId, {subscriberId, topic, client});
    this._subscriptionChange$.next({topic});
  }

  /**
   * Unsubscribes a subscriber; has no effect if not registered.
   *
   * @param subscriberId - Unique identify of the subscriber.
   */
  public unsubscribe(subscriberId: string): void {
    Defined.orElseThrow(subscriberId, () => Error('[TopicUnsubscribeError] SubscriberId required'));

    const subscription = this._subscriptionRegistry.get(subscriberId);
    if (subscription) {
      this._subscriptionRegistry.delete(subscriberId);
      this._subscriptionChange$.next({topic: subscription.topic});
    }
  }

  /**
   * Unregisters all subscriptions of a client.
   *
   * @param clientId - Identifies the client which should be unsubscribed from all its topics.
   */
  public unsubscribeClient(clientId: string): void {
    Defined.orElseThrow(clientId, () => Error('[TopicUnsubscribeError] ClientId required'));

    const subscriptions = this.subscriptions.filter(subscription => subscription.client.id === clientId);
    // First, remove all subscriptions, then, notify about topic subscription change. This order is relevant if
    // the client has subscribed to a topic multiple times, allowing {@link TopicSubscriptionRegistry#subscriptionCount$}
    // to emit only once.
    subscriptions.forEach(subscription => this._subscriptionRegistry.delete(subscription.subscriberId));
    subscriptions.forEach(subscription => this._subscriptionChange$.next({topic: subscription.topic}));
  }

  /**
   * Allows observing the number of subscriptions on a topic. It is not allowed to use wildcards in the topic to observe.
   *
   * @param  topic - Specifies the topic to observe.
   * @return An Observable that, when subscribed, emits the current number of subscribers on it. It never completes and
   *         emits continuously when the number of subscribers changes.
   */
  public subscriptionCount$(topic: string): Observable<number> {
    if (TopicMatcher.containsWildcardSegments(topic)) {
      throw Error(`[TopicObserveError] Observing the number of subscribers is only allowed on exact topics. Exact topics must not contain wildcard segments. [topic='${topic}']`);
    }

    return this._subscriptionChange$
      .pipe(
        startWith({topic}),
        filter(subscriptionChange => new TopicMatcher(subscriptionChange.topic).matcher(topic).matches),
        map(() => this.resolveTopicDestinations(topic).length),
        distinctUntilChanged(),
      );
  }

  /**
   * Resolves the destinations to which to transport a message published to the given topic.
   *
   * A client can have multiple subscriptions that match the topic; in this case, multiple destinations are returned, one
   * per subscription. Use the subscription id to map the destination to the subscription.
   */
  public resolveTopicDestinations(publishTopic: string): ResolvedTopicDestination[] {
    return this.subscriptions.reduce((resolvedTopicDestinations: ResolvedTopicDestination[], subscription: TopicSubscription) => {
      const matcher = new TopicMatcher(subscription.topic).matcher(publishTopic);
      if (matcher.matches) {
        return resolvedTopicDestinations.concat({subscription, topic: publishTopic, params: matcher.params});
      }
      return resolvedTopicDestinations;
    }, [] as ResolvedTopicDestination[]);
  }

  private get subscriptions(): TopicSubscription[] {
    return Array.from(this._subscriptionRegistry.values());
  }
}

/**
 * Represents a subscription on a topic. The topic may contain wildcard segments.
 * @ignore
 */
export interface TopicSubscription {
  /**
   * Unique identify of the subscriber.
   */
  subscriberId: string;
  /**
   * Topic subscribed by the subscriber; if subscribed to multiple topics (using the colon syntax),
   * the resolved segment values are contained in the params map.
   */
  topic: string;
  /**
   * The client which subscribed to the topic.
   */
  client: Client;
}

/**
 * Represents the actual destination to which to transport a topic message.
 * @ignore
 */
export interface ResolvedTopicDestination {
  /**
   * Exact topic to which the message was published.
   */
  topic: string;
  /**
   * Contains the resolved values of the wildcard segments as specified in the subscription topic.
   * For example: If subscribed to the topic `person/:id` and a message is published to the topic `person/5`,
   * the resolved id with the value `5` is contained in the params map.
   */
  params: Map<string, string>;
  /**
   * The actual subscription to which to transport the message.
   */
  subscription: TopicSubscription;
}

/**
 * Event emitted when some subscriber subscribes or unsubscribes on a topic.
 * @ignore
 */
interface SubscriptionChangeEvent {
  topic: string;
}
