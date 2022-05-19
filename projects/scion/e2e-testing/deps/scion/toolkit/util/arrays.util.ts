/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Defined} from './defined.util';
import {identity} from 'rxjs';

/**
 * Provides array utility methods.
 */
export namespace Arrays {

  /**
   * Returns the value, if an array, or adds it to an array. If `null` or `undefined` is given, by default, returns an empty array.
   */
  export function coerce<T>(value: T | T[] | null | undefined, options?: {coerceNullOrUndefined: true} | {}): NonNullable<T[]>;
  export function coerce<T>(value: T | T[] | null | undefined, options: {coerceNullOrUndefined: false}): T[] | null | undefined;
  export function coerce<T>(value: T | T[] | null | undefined, options?: {coerceNullOrUndefined?: boolean}): T[] | null | undefined {
    if (value === null || value === undefined) {
      if (Defined.orElse(options && options.coerceNullOrUndefined, true)) {
        return [];
      }
      return value as null | undefined;
    }

    return Array.isArray(value) ? value : [value];
  }

  /**
   * Compares items of given arrays for reference equality.
   *
   * Use the parameter `exactOrder` to control if the item order must be equal (which is by default) or not.
   */
  export function isEqual(array1: any[], array2: any[], options?: {exactOrder?: boolean}): boolean {
    if (array1 === array2) {
      return true;
    }
    if (!array1 || !array2) {
      return false;
    }
    if (array1.length !== array2.length) {
      return false;
    }

    const exactOrder = Defined.orElse(options && options.exactOrder, true);
    return array1.every((item, index) => {
      if (exactOrder) {
        return item === array2[index];
      }
      else {
        return array2.includes(item);
      }
    });
  }

  /**
   * Removes the specified element from an array, or the elements which satisfy the provided predicate function.
   * The original array will be changed.
   *
   * @param  array - The array from which elements should be removed.
   * @param  element - The element to be removed, or a predicate function to resolve elements which to be removed.
   * @param  options - Control if to remove all occurrences of the element. If not specified, all occurrences are removed.
   * @return the elements removed from the array.
   */
  export function remove<T>(array: T[], element: any | ((element: T) => boolean), options?: {firstOnly: boolean}): T[] {
    const firstOnly = Defined.orElse(options && options.firstOnly, false);

    // define a function to resolve the element's index in the original array
    const indexOfElementFn = ((): () => number => {
      if (typeof element === 'function') {
        return (): number => array.findIndex(element);
      }
      else {
        return (): number => array.indexOf(element);
      }
    })();

    const removedElements = [];
    for (let i = indexOfElementFn(); i !== -1; i = indexOfElementFn()) {
      removedElements.push(...array.splice(i, 1)); // changes the original array
      if (firstOnly) {
        break;
      }
    }
    return removedElements;
  }

  /**
   * Removes duplicate items from the array. The original array will not be modified.
   *
   * Use the parameter `keySelector` to provide a function for comparing objects.
   */
  export function distinct<T>(items: T[], keySelector: (item: T) => any = identity): T[] {
    const itemSet = new Set(items.map(keySelector));
    return items.filter(item => itemSet.delete(keySelector(item)));
  }

  /**
   * Intersects the given arrays, returning a new array containing all the elements contained in every array.
   * Arrays which are `undefined` or `null` are ignored.
   */
  export function intersect<T>(...arrays: Array<T[] | undefined | null>): T[] {
    const _arrays = arrays.filter(array => array !== undefined && array !== null) as Array<T[]>;

    if (!_arrays.length) {
      return [];
    }

    const first = _arrays.pop()!;
    return _arrays.reduce((intersection, array) => intersection.filter(value => array.includes(value)), [...first]);
  }

  /**
   * Returns the last element in the given array, optionally matching the predicate if given.
   *
   * Returns `undefined` if no element is found.
   */
  export function last<T>(array: T[], predicate?: (item: T) => boolean): T | undefined {
    if (!array) {
      return undefined;
    }

    if (!predicate) {
      return array[array.length - 1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
      if (predicate(array[i])) {
        return array[i];
      }
    }

    return undefined;
  }
}
