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

/**
 * Provides utility methods for {@link Map}.
 */
export class Maps {

  private constructor() {
  }

  /**
   * Adds the given value into a {@link Set} in the multi value {@link Map}.
   */
  public static addSetValue<K, V>(multiValueMap: Map<K, Set<V>>, key: K, value: V): Map<K, Set<V>> {
    const values = multiValueMap.get(key) || new Set<V>();
    return multiValueMap.set(key, values.add(value));
  }

  /**
   * Removes the given value or values matching the given predicate from the multi {@link Map}.
   *
   * @return `true` if the element was removed, or `false` otherwise.
   */
  public static removeSetValue<K, V>(multiValueMap: Map<K, Set<V>>, key: K, value: V | PredicateFn<V>): boolean {
    const values = multiValueMap.get(key) || new Set<V>();

    let hasRemoved = false;
    if (typeof value === 'function') {
      hasRemoved = Array.from(values)
        .filter(value as PredicateFn<V>)
        .reduce((removed, it) => values.delete(it) || removed, false);
    }
    else {
      hasRemoved = values.delete(value);
    }

    if (hasRemoved && !values.size) {
      multiValueMap.delete(key);
    }
    return hasRemoved;
  }

  /**
   * Adds the given value into an {@link Array} in the multi value {@link Map}.
   */
  public static addListValue<K, V>(map: Map<K, V[]>, key: K, value: V): Map<K, V[]> {
    const values = map.get(key) || [];
    return map.set(key, values.concat(value));
  }

  /**
   * Removes the given value or values matching the given predicate from the multi {@link Map}.
   *
   * @return `true` if the element was removed, or `false` otherwise.
   */
  public static removeListValue<K, V>(multiValueMap: Map<K, V[]>, key: K, value: V | PredicateFn<V>): boolean {
    const values = multiValueMap.get(key) || [];
    const hasRemoved = Arrays.remove(values, value, {firstOnly: false}).length > 0;
    if (hasRemoved && !values.length) {
      multiValueMap.delete(key);
    }
    return hasRemoved;
  }
}

/**
 * Represents a predicate function which returns `true` or `false`.
 */
export type PredicateFn<T> = (value: T) => boolean;
