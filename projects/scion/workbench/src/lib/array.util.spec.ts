/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Arrays } from './array.util';

fdescribe('Arrays', () => {

  describe('Arrays.equal', () => {

    it('should be equal for same array references', () => {
      const array = ['a', 'b', 'c'];
      expect(Arrays.equal(array, array)).toBeTruthy();
    });

    it('should be equal for same elements (same order)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'b', 'c'];
      expect(Arrays.equal(array1, array2)).toBeTruthy();
    });

    it('should be equal for same elements (unordered)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.equal(array1, array2, false)).toBeTruthy();
    });

    it('should not be equal for different elements (1)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'b', 'c', 'e'];
      expect(Arrays.equal(array1, array2)).toBeFalsy();
    });

    it('should not be equal for different elements (2)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'B', 'c'];
      expect(Arrays.equal(array1, array2)).toBeFalsy();
    });

    it('should not be equal if ordered differently', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.equal(array1, array2)).toBeFalsy();
    });

    it('should be equal if ordered differently', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.equal(array1, array2, false)).toBeTruthy();
    });
  });
});
