/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Urls } from './url.util';

describe('Urls', () => {

  describe('Urls.isAbsoluteUrl', () => {

    it('should evaluate to `true` if given an absolute URL (http)', () => {
      expect(Urls.isAbsoluteUrl('http://localhost:4200')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('http://localhost:4200/#/')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('http://localhost:4200/a/b/c')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('http://localhost:4200/#/a/b/c')).toBeTruthy();
    });

    it('should evaluate to `true` if given an absolute URL (https)', () => {
      expect(Urls.isAbsoluteUrl('https://localhost:4200')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('https://localhost:4200/#/')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('https://localhost:4200/a/b/c')).toBeTruthy();
      expect(Urls.isAbsoluteUrl('https://localhost:4200/#/a/b/c')).toBeTruthy();
    });

    it('should evaluate to `false` if given a relative URL', () => {
      expect(Urls.isAbsoluteUrl('../a/b/c')).toBeFalsy();
      expect(Urls.isAbsoluteUrl('./a/b/c')).toBeFalsy();
      expect(Urls.isAbsoluteUrl('/a/b/c')).toBeFalsy();
      expect(Urls.isAbsoluteUrl('a/b/c')).toBeFalsy();
    });

    it('should evaluate to `true` if given the \'about:blank\' URL', () => {
      expect(Urls.isAbsoluteUrl('about:blank')).toBeTruthy();
    });
  });
});
