/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageHeaders, TopicMessage } from '../../messaging.model';
import { TopicMatcher } from '../../topic-matcher.util';
import { Defined } from '@scion/toolkit/util';

/**
 * Central point for persisting and looking up retained messages sent to a topic.
 *
 * @ignore
 */
export class RetainedMessageStore {

  private readonly _retainedMessagesByTopic = new Map<string, TopicMessage>();

  /**
   * Persists the given message unless it has no body. In that case, the message is deleted.
   *
   * @return the status of whether the message was persisted or deleted.
   */
  public persistOrDelete(message: TopicMessage): 'deleted' | 'persisted' {
    if (message.body === undefined) {
      this._retainedMessagesByTopic.delete(message.topic);
      return 'deleted';
    }

    this._retainedMessagesByTopic.set(message.topic, message);
    return 'persisted';
  }

  /**
   * Finds the retained message which was most recently published to a topic matching the given subscription topic.
   * If no message is retained on that topic, this method returns `null`.
   */
  public findMostRecentRetainedMessage(subscriptionTopic: string): TopicMessage | null {
    if (!TopicMatcher.containsWildcardSegments(subscriptionTopic)) {
      return this._retainedMessagesByTopic.get(subscriptionTopic) || null;
    }

    const retainedMessages = Array.from(this._retainedMessagesByTopic.values());
    return retainedMessages.reduce((mostRecentMessage, message) => {
      const lastMessageTimestamp = Defined.orElse(mostRecentMessage && mostRecentMessage.headers.get(MessageHeaders.Timestamp), 0);

      const messageMatcher = new TopicMatcher(subscriptionTopic).matcher(message.topic);
      if (messageMatcher.matches && message.headers.get(MessageHeaders.Timestamp) > lastMessageTimestamp) {
        return message;
      }
      return mostRecentMessage;
    }, null as TopicMessage);
  }
}
