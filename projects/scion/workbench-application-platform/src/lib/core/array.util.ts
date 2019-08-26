/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { QueryList } from '@angular/core';

/**
 * Provides array utility methods.
 */
export class Arrays {

  private constructor() {
  }

  /**
   * Creates an array from the given value, or returns the value if already an array.
   */
  public static from(value: string | string[]): string[] {
    if (!value || !value.length) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  /**
   * Compares items of given arrays for reference equality.
   *
   * Use the parameter `exactOrder` to control if the item order must be equal.
   */
  public static equal(array1: any[], array2: any[], exactOrder: boolean = true): boolean {
    if (array1 === array2) {
      return true;
    }

    if (array1.length !== array2.length) {
      return false;
    }

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
   * Finds the last item matching the given predicate, if any,
   * or returns the last item in the array if no predicate is specified.
   *
   * Returns `undefined` if no element is found.
   */
  public static last<T>(items: T[] | QueryList<T>, predicate?: (item: T) => boolean): T | undefined {
    const array = items ? (Array.isArray(items) ? items : items.toArray()) : [];

    if (!predicate) {
      return array[array.length - 1];
    }
    return [...array].reverse().find(predicate);
  }

  /**
   * Removes given item from the array. The original array will not be modified.
   */
  public static remove<T>(items: T[], item: T): T[] {
    const result = [...items];
    for (let index = result.indexOf(item); index !== -1; index = result.indexOf(item)) {
      result.splice(index, 1);
    }
    return result;
  }

  /**
   * Removes duplicate items from the array. The original array will not be modified.
   *
   * Use the parameter `identityFn` to provide a function for comparing objects.
   */
  public static distinct<T>(items: T[], identityFn: (item: T) => any = (item: T): any => item): T[] {
    const visitedItems = new Set<T>();
    return items.filter(item => {
      const identity = identityFn(item);
      if (visitedItems.has(identity)) {
        return false;
      }
      visitedItems.add(identity);
      return true;
    });
  }
}
