/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Arrays } from '@scion/toolkit/util';

/**
 * Allows checking whether the topic of a message matches the subscribed topic of a subscriber. The subscriber can use wildcard segments in
 * its subscription topic to subscribe to multiple topics simultaneously.
 *
 * Topics are case-sensitive and consist of one or more segments each separated by a forward slash. If a segment begins with a colon (:),
 * then the segment acts as a placeholder for any string value. Placeholders can only be used to subscribe to topics, not to publish a message.
 */
export class TopicMatcher {

  private readonly _patternTopicSegments: string[];

  constructor(subscriptionTopic: string) {
    this._patternTopicSegments = toPathSegments(subscriptionTopic || '');
    if (!this._patternTopicSegments.length) {
      throw Error('[TopicMatcherError] A topic must consist of one or more segments each separated by a forward slash.');
    }
  }

  /**
   * Attempts to match the given topic against the subscription topic which was passed to the constructor as an argument.
   *
   * If the match succeeds, then {@link MatcherResult#matches} evaluates to `true`. If the subscription topic contains wildcard segments,
   * the segment values can be read using the property {@link TopicMessage#params} property.
   */
  public matcher(publishTopic: string): MatcherResult {
    const publishTopicSegments = toPathSegments(publishTopic || '');
    const patternTopicSegments = this._patternTopicSegments;

    if (!publishTopicSegments.length) {
      throw Error('[TopicMatcherError] A topic must consist of one or more segments each separated by a forward slash.');
    }
    if (publishTopicSegments.some(isWildcardSegment)) {
      throw Error('[TopicMatcherError] A wildcard can only be used to subscribe to topics, not to publish a message.');
    }
    if (patternTopicSegments.length !== publishTopicSegments.length) {
      return {matches: false};
    }
    if (Arrays.isEqual(publishTopicSegments, patternTopicSegments, {exactOrder: true})) {
      return {matches: true, params: new Map()};
    }
    if (!patternTopicSegments.some(isWildcardSegment)) {
      return {matches: false};
    }
    if (!patternTopicSegments.every((patternSegment, i) => patternSegment === publishTopicSegments[i] || isWildcardSegment(patternSegment))) {
      return {matches: false};
    }

    return {
      matches: true,
      params: patternTopicSegments.reduce((params, segment, i) => {
        if (isWildcardSegment(segment)) {
          return params.set(segment.substr(1), publishTopicSegments[i]);
        }
        return params;
      }, new Map()),
    };
  }

  /**
   * Checks if the given topic contains wildcard segments (colon syntax) to match any string value.
   */
  public static containsWildcardSegments(topic: string): boolean {
    // As of ng-packagr 8.x, the prod build fails if directly invoking a non-exported function from inside a static function.
    // To workaround this build issue, we first assign the function to a local variable.
    const toPathSegmentsFn = toPathSegments; //
    return toPathSegmentsFn(topic).some(isWildcardSegment);
  }
}

function isWildcardSegment(segment: string): boolean {
  return segment.startsWith(':') && segment.length > 1;
}

function toPathSegments(topic: string): string[] {
  return topic.split('/').filter(Boolean);
}

export interface MatcherResult {
  /**
   * Indicates if the topic matches the subscription topic.
   */
  matches: boolean;
  /**
   * Contains the actual values for the wildcard segments as defined in the subscription topic; is only set if the match is successful.
   */
  params?: Map<string, string>;
}
