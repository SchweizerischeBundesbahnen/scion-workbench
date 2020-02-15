/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Arrays, Defined } from '@scion/toolkit/util';
import { TopicMatcher } from '../../topic-matcher.util';
import { Observable, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { Client } from './client.registry';

/**
 * Central point for managing topic subscriptions.
 *
 * @ignore
 */
export class TopicSubscriptionRegistry {

  private readonly _topicSubscriptions: TopicSubscription[] = [];
  private readonly _subscriptionChange$ = new Subject<SubscriptionChangeEvent>();

  /**
   * Registers a subscription to receive messages sent to the given topic.
   *
   * After calling this method, messages that are published on that topic are transported to the
   * given client until {@link unsubscribe} or {@link unsubscribeClient} is called.
   *
   * @param topic - The topic which to observe; it allows using wildcard segments, e.g., `person/:id`.
   * @param client - The client which subscribes to the topic.
   * @param subscriberId - Unique id which identifies the subscriber.
   */
  public subscribe(topic: string, client: Client, subscriberId: string): void {
    Defined.orElseThrow(subscriberId, () => Error('[SubscribeError] SubscriberId required'));
    Defined.orElseThrow(topic, () => Error('[SubscribeError] Topic required'));
    Defined.orElseThrow(client, () => Error('[SubscribeError] Client required'));

    this._topicSubscriptions.push({id: subscriberId, topic: topic, client: client});
    this._subscriptionChange$.next({topic});
  }

  /**
   * Unregisters a subscription; has no effect if not registered.
   * If the client has multiple subscriptions on the topic, only one subscription is removed.
   *
   * @param topic - The topic from which to unsubscribe from.
   * @param clientId - Identifies the client which should be unsubscribed from the topic.
   */
  public unsubscribe(topic: string, clientId: string): void {
    Arrays.remove(this._topicSubscriptions, it => it.client.id === clientId && it.topic === topic, {firstOnly: true})
      .map(removedSubscription => removedSubscription.topic)
      .forEach(it => this._subscriptionChange$.next({topic: it}));
  }

  /**
   * Unregisters all subscriptions of a client.
   *
   * @param clientId - Identifies the client which should be unsubscribed from all its topics.
   */
  public unsubscribeClient(clientId: string): void {
    Arrays.remove(this._topicSubscriptions, it => it.client.id === clientId, {firstOnly: false})
      .map(removedSubscription => removedSubscription.topic)
      .reduce((set, removedSubscription) => set.add(removedSubscription), new Set<string>()) // distinct
      .forEach(it => this._subscriptionChange$.next({topic: it}));
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
      throw Error(`[TopicObserveError] Observing the number of subscribers is only allowed on exact topics, which are topics that do not contain wildcard segments. [topic='${topic}']`);
    }

    return this._subscriptionChange$
      .pipe(
        startWith({topic}),
        filter(subscriptionChange => new TopicMatcher(subscriptionChange.topic).matcher(topic).matches),
        map(() => this.resolveTopicDestinations(topic).length),
      );
  }

  /**
   * Resolves the destinations to which to transport a message published to the given topic.
   *
   * A client can have multiple subscriptions that match the topic; in this case, multiple destinations are returned, one
   * per subscription. Use the subscription id to map the destination to the subscription.
   */
  public resolveTopicDestinations(publishTopic: string): ResolvedTopicDestination[] {
    return this._topicSubscriptions.reduce((resolvedTopicDestinations: ResolvedTopicDestination[], subscription: TopicSubscription) => {
      const matcher = new TopicMatcher(subscription.topic).matcher(publishTopic);
      if (matcher.matches) {
        return resolvedTopicDestinations.concat({subscription, topic: publishTopic, params: matcher.params});
      }
      return resolvedTopicDestinations;
    }, [] as ResolvedTopicDestination[]);
  }
}

/**
 * Represents a subscription on a topic. The topic may contain wildcard segments.
 * @ignore
 */
export interface TopicSubscription {
  /**
   * Unique id of the subscription; is used for the reverse mapping to the subscription.
   */
  id: string;
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
