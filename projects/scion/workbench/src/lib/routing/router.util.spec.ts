/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {RouterUtils} from './router.util';
import {TestBed} from '@angular/core/testing';
import {UrlSegment} from '@angular/router';

describe('RouterUtils', () => {

  describe('commandsToSegments', () => {

    it('should convert commands to segments', () => {
      TestBed.runInInjectionContext(() => {
        expect(RouterUtils.commandsToSegments(['a', 'b', 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
        expect(RouterUtils.commandsToSegments(['a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
        expect(RouterUtils.commandsToSegments(['/a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
      });
    });

    it('should convert commands that contain matrix parameters', () => {
      TestBed.runInInjectionContext(() => {
        expect(RouterUtils.commandsToSegments(['a', 'b', 'c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
        expect(RouterUtils.commandsToSegments(['a/b/c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
        expect(RouterUtils.commandsToSegments(['a', 'b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
        expect(RouterUtils.commandsToSegments(['a/b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
      });
    });

    it('should return empty segment array if not passing commands', () => {
      TestBed.runInInjectionContext(() => {
        expect(RouterUtils.commandsToSegments([])).toEqual([]);
        expect(RouterUtils.commandsToSegments([''])).toEqual([]);
        expect(RouterUtils.commandsToSegments(['', ''])).toEqual([]);
      });
    });

    it('should error if root segment contains matrix parameters', () => {
      TestBed.runInInjectionContext(() => {
        expect(() => RouterUtils.commandsToSegments(['', {name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
        expect(() => RouterUtils.commandsToSegments([{name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
      });
    });
  });
});
