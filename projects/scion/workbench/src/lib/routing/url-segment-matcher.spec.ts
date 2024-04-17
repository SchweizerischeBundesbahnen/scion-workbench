/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UrlSegmentMatcher} from './url-segment-matcher';
import {segments} from '../testing/testing.util';

describe('UrlSegmentMatcher', () => {

  describe('Flags: {matchMatrixParams: false}', () => {
    it('should match segments (pattern without matrix params)', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', 'b', 'c']), {matchMatrixParams: false, matchWildcardPath: false});
      expect(matcher.matches(segments(['a', 'b', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]))).toBeTrue();
      expect(matcher.matches(segments(['a', 'c', 'b']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b', 'c', 'd']))).toBeFalse();
      expect(matcher.matches(segments([]))).toBeFalse();
      expect(matcher.matches(segments(['']))).toBeFalse();
    });

    it('should match segments (pattern with matrix params)', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]), {matchMatrixParams: false, matchWildcardPath: false});
      expect(matcher.matches(segments(['a', 'b', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]))).toBeTrue();
      expect(matcher.matches(segments(['a', 'c', 'b']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b', 'c', 'd']))).toBeFalse();
      expect(matcher.matches(segments([]))).toBeFalse();
      expect(matcher.matches(segments(['']))).toBeFalse();
    });
  });

  describe('Flags: {matchMatrixParams: true}', () => {
    it('should match segments (pattern without matrix params)', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', 'b', 'c']), {matchMatrixParams: true, matchWildcardPath: false});
      expect(matcher.matches(segments(['a', 'b', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]))).toBeFalse();
    });

    it('should match segments (pattern with matrix params)', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]), {matchMatrixParams: true, matchWildcardPath: false});
      expect(matcher.matches(segments(['a', 'b', 'c']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2'}]))).toBeTrue();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1'}]))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'value2', param3: 'value3'}]))).toBeFalse();
      expect(matcher.matches(segments(['a', 'b', 'c', {param1: 'value1', param2: 'other'}]))).toBeFalse();
    });
  });

  describe('Flags: {matchWildcardPath: false}', () => {
    it('should match segments', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', '*', 'c']), {matchMatrixParams: false, matchWildcardPath: false});
      expect(matcher.matches(segments(['a', '*', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'x', 'c']))).toBeFalse();
      expect(matcher.matches(segments(['a', 'c']))).toBeFalse();
    });
  });

  describe('Flags: {matchWildcardPath: true}', () => {
    it('should match segments', () => {
      const matcher = new UrlSegmentMatcher(segments(['a', '*', 'c']), {matchMatrixParams: false, matchWildcardPath: true});
      expect(matcher.matches(segments(['a', '*', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'x', 'c']))).toBeTrue();
      expect(matcher.matches(segments(['a', 'c']))).toBeFalse();
    });
  });
});
