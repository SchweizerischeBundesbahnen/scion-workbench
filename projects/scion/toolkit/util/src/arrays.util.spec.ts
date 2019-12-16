/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Arrays } from './arrays.util';

describe('Arrays', () => {

  describe('Arrays.equal', () => {

    it('should be equal for same array references', () => {
      const array = ['a', 'b', 'c'];
      expect(Arrays.isEqual(array, array)).toBeTruthy();
    });

    it('should be equal for same elements (same order)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'b', 'c'];
      expect(Arrays.isEqual(array1, array2)).toBeTruthy();
    });

    it('should be equal for same elements (unordered)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.isEqual(array1, array2, {exactOrder: false})).toBeTruthy();
    });

    it('should not be equal for different elements (1)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'b', 'c', 'e'];
      expect(Arrays.isEqual(array1, array2)).toBeFalsy();
    });

    it('should not be equal for different elements (2)', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'B', 'c'];
      expect(Arrays.isEqual(array1, array2)).toBeFalsy();
    });

    it('should not be equal if ordered differently', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.isEqual(array1, array2)).toBeFalsy();
    });

    it('should be equal if ordered differently', () => {
      const array1 = ['a', 'b', 'c'];
      const array2 = ['a', 'c', 'b'];
      expect(Arrays.isEqual(array1, array2, {exactOrder: false})).toBeTruthy();
    });

    it('should compare \'null\' and \'undefined\' arrays', () => {
      expect(Arrays.isEqual(null, ['a', 'b', 'c'])).toBeFalsy();
      expect(Arrays.isEqual(undefined, ['a', 'b', 'c'])).toBeFalsy();
      expect(Arrays.isEqual(['a', 'b', 'c'], null)).toBeFalsy();
      expect(Arrays.isEqual(['a', 'b', 'c'], undefined)).toBeFalsy();
      expect(Arrays.isEqual(null, null)).toBeTruthy();
      expect(Arrays.isEqual(undefined, undefined)).toBeTruthy();
      expect(Arrays.isEqual(null, undefined)).toBeFalsy();
      expect(Arrays.isEqual(undefined, null)).toBeFalsy();
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

  describe('Arrays.removeByItem', () => {

    it('should remove the specified element', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      expect(Arrays.remove(array, 'c', {firstOnly: true})).toEqual(['c']);
      expect(array).toEqual(['a', 'b', 'd', 'e']);
    });

    it('should remove the first occurrence of the specified element', () => {
      const array = ['a', 'b', 'c', 'd', 'e', 'c', 'g'];
      expect(Arrays.remove(array, 'c', {firstOnly: true})).toEqual(['c']);
      expect(array).toEqual(['a', 'b', 'd', 'e', 'c', 'g']);
    });

    it('should remove all occurrences of the specified element', () => {
      const array = ['a', 'b', 'c', 'd', 'e', 'c', 'g'];
      expect(Arrays.remove(array, 'c', {firstOnly: false})).toEqual(['c', 'c']);
      expect(array).toEqual(['a', 'b', 'd', 'e', 'g']);
    });

    it('should return an empty array if the element is not contained', () => {
      const array = ['a', 'b', 'c'];
      expect(Arrays.remove(array, 'C', {firstOnly: false})).toEqual([]);
      expect(array).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Arrays.removeByPredicate', () => {
    const a1 = {key: 'a', value: '1'};
    const b2 = {key: 'b', value: '2'};
    const c3 = {key: 'c', value: '3'};
    const d4 = {key: 'd', value: '4'};
    const e5 = {key: 'e', value: '5'};
    const c6 = {key: 'c', value: '6'};
    const g7 = {key: 'g', value: '7'};

    it('should remove the specified element', () => {
      const array = [a1, b2, c3, d4, e5];
      expect(Arrays.remove(array, item => item.key === 'c', {firstOnly: true})).toEqual([c3]);
      expect(array).toEqual([a1, b2, d4, e5]);
    });

    it('should remove the first occurrence of the specified element', () => {
      const array = [a1, b2, c3, d4, e5, c6, g7];
      expect(Arrays.remove(array, item => item.key === 'c', {firstOnly: true})).toEqual([c3]);
      expect(array).toEqual([a1, b2, d4, e5, c6, g7]);
    });

    it('should remove all occurrences of the specified element', () => {
      const array = [a1, b2, c3, d4, e5, c6, g7];
      expect(Arrays.remove(array, item => item.key === 'c', {firstOnly: false})).toEqual([c3, c6]);
      expect(array).toEqual([a1, b2, d4, e5, g7]);
    });

    it('should return an empty array if the element is not contained', () => {
      const array = [a1, b2, c3];
      expect(Arrays.remove(array, item => item.key === 'C', {firstOnly: false})).toEqual([]);
      expect(array).toEqual([a1, b2, c3]);
    });
  });

  describe('Arrays.distinct', () => {

    it('should remove duplicate string items', () => {
      const array = ['a', 'a', 'b', 'c', 'd', 'e', 'c'];
      expect(Arrays.distinct(array)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should remove duplicate objects by reference', () => {
      const apple = {id: 1, name: 'apple'};
      const banana = {id: 2, name: 'banana'};
      const cherry = {id: 3, name: 'cherry'};

      const array = [apple, banana, cherry, banana, apple];
      expect(Arrays.distinct(array)).toEqual([apple, banana, cherry]);
    });

    it('should remove duplicate objects by a given identity function', () => {
      const apple = {id: 1, name: 'apple'};
      const banana = {id: 2, name: 'banana'};
      const cherry = {id: 3, name: 'cherry'};
      const appleOtherInstance = {...apple};
      const bananaOtherInstance = {...banana};

      const array = [apple, banana, cherry, bananaOtherInstance, appleOtherInstance];
      expect(Arrays.distinct(array, (fruit) => fruit.id)).toEqual([apple, banana, cherry]);
    });

    it('should not modify the original array', () => {
      const array = ['a', 'a', 'b', 'c', 'd', 'e', 'c'];
      expect(Arrays.distinct(array)).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(array).toEqual(['a', 'a', 'b', 'c', 'd', 'e', 'c']);
    });
  });
});
