/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Arrays } from './array.util';

describe('Arrays', () => {

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

  describe('Arrays.last', () => {

    it('should find the last item matching the predicate', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.last(array, (item: string): boolean => item === 'c')).toEqual('c');
    });

    it('should return `undefined` if no element matches the predicate', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.last(array, () => false)).toBeUndefined();
    });

    it('should return the last item in the array if no predicate is specified', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.last(array)).toEqual('e');
    });

    it('should return `undefined` if the array is empty', () => {
      expect(Arrays.last([])).toBeUndefined();
      expect(Arrays.last([], () => true)).toBeUndefined();
    });
  });

  describe('Arrays.remove', () => {

    it('should remove the specified element', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.remove(array, 'c')).toEqual(['a', 'b', 'd', 'e']);
    });

    it('should not modify the original array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.remove(array, 'c')).toEqual(['a', 'b', 'd', 'e']);
      expect(array).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });
});
