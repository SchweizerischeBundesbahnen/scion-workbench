/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {of} from 'rxjs';
import {filterNull} from './operators';
import {ObserveCaptor} from '@scion/toolkit/testing';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';

describe('RxJS Operators', () => {

  describe('filterNull', () => {

    it('should filter `null` emissions', () => {
      const captor = new ObserveCaptor();
      of(null, 'a', 'b', null, 'c', undefined, 'd')
        .pipe(filterNull())
        .subscribe(captor);

      expect(captor.getValues()).toEqual(['a', 'b', 'c', undefined, 'd']);
    });
  });
});
