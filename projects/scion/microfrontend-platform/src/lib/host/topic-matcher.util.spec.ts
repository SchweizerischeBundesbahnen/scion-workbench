/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { TopicMatcher } from './topic-matcher.util';

describe('TopicMatcher', () => {

  it('should detect wildcard segments in the topic', () => {
    expect(TopicMatcher.containsWildcardSegments('myhome/livingroom/temperature')).toBeFalsy();
    expect(TopicMatcher.containsWildcardSegments('myhome/livingroom/:measurement')).toBeTruthy();
    expect(TopicMatcher.containsWildcardSegments('myhome/kitchen/:measurement')).toBeTruthy();
    expect(TopicMatcher.containsWildcardSegments('myhome/:room/temperature')).toBeTruthy();
    expect(TopicMatcher.containsWildcardSegments('myhome/:room/:measurement')).toBeTruthy();
    expect(TopicMatcher.containsWildcardSegments(':building/kitchen/:measurement')).toBeTruthy();
    expect(TopicMatcher.containsWildcardSegments('myhome/:/temperature')).toBeFalsy();
  });

  it('should throw if the subscription topic is `null`, `undefined` or empty', () => {
    expect(() => new TopicMatcher('')).toThrowError(/TopicMatcherError/);
    expect(() => new TopicMatcher(null)).toThrowError(/TopicMatcherError/);
    expect(() => new TopicMatcher(undefined)).toThrowError(/TopicMatcherError/);
  });

  it('should throw if the publish topic is `null`, `undefined` or empty', () => {
    expect(() => new TopicMatcher('myhome/livingroom/temperature').matcher('')).toThrowError(/TopicMatcherError/);
    expect(() => new TopicMatcher('myhome/livingroom/temperature').matcher(null)).toThrowError(/TopicMatcherError/);
    expect(() => new TopicMatcher('myhome/livingroom/temperature').matcher(undefined)).toThrowError(/TopicMatcherError/);
  });

  it('should throw if the publish topic contains wildcard segments', () => {
    expect(() => new TopicMatcher('myhome/livingroom/temperature').matcher('myhome/livingroom/:temperature')).toThrowError(/TopicMatcherError/);
  });

  describe('The topic \'myhome/livingroom/temperature\'', () => {

    const publishTopic = 'myhome/livingroom/temperature';

    it('should not match the subscription \'myhome/livingroom\'', () => {
      const matcher = new TopicMatcher('myhome/livingroom').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should not match the subscription \'myhome/temperature/livingroom\'', () => {
      const matcher = new TopicMatcher('myhome/temperature/livingroom').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should not match the subscription \'myhome/livingroom/temperature/celsius\'', () => {
      const matcher = new TopicMatcher('myhome/livingroom/temperature/celsius').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should match the subscription \'myhome/livingroom/temperature\'', () => {
      const matcher = new TopicMatcher('myhome/livingroom/temperature').matcher(publishTopic);
      expect(matcher.matches).toBeTruthy();
      expect(matcher.params).toEqual(new Map());
    });

    it('should match the subscription \'myhome/livingroom/:measurement\'', () => {
      const matcher = new TopicMatcher('myhome/livingroom/:measurement').matcher(publishTopic);
      expect(matcher.matches).toBeTruthy();
      expect(matcher.params).toEqual(new Map().set('measurement', 'temperature'));
    });

    it('should not match the subscription \'myhome/kitchen/:measurement\'', () => {
      const matcher = new TopicMatcher('myhome/kitchen/:measurement').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should match the subscription \'myhome/:room/temperature\'', () => {
      const matcher = new TopicMatcher('myhome/:room/temperature').matcher(publishTopic);
      expect(matcher.matches).toBeTruthy();
      expect(matcher.params).toEqual(new Map().set('room', 'livingroom'));
    });

    it('should match the subscription \'myhome/:room/:measurement\'', () => {
      const matcher = new TopicMatcher('myhome/:room/:measurement').matcher(publishTopic);
      expect(matcher.matches).toBeTruthy();
      expect(matcher.params).toEqual(new Map().set('room', 'livingroom').set('measurement', 'temperature'));
    });

    it('should not match the subscription \':building/kitchen/:measurement\'', () => {
      const matcher = new TopicMatcher(':building/kitchen/:measurement').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should match the subscription \':building/livingroom/:measurement\'', () => {
      const matcher = new TopicMatcher(':building/livingroom/:measurement').matcher(publishTopic);
      expect(matcher.matches).toBeTruthy();
      expect(matcher.params).toEqual(new Map().set('building', 'myhome').set('measurement', 'temperature'));
    });

    it('should not match the subscription \'myhome/bedroom/temperature\'', () => {
      const matcher = new TopicMatcher('myhome/bedroom/temperature').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });

    it('should not match the subscription \'myhome/:/temperature\'', () => {
      const matcher = new TopicMatcher('myhome/:/temperature').matcher(publishTopic);
      expect(matcher.matches).toBeFalsy();
      expect(matcher.params).toBeUndefined();
    });
  });
});
