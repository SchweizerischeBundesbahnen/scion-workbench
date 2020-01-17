/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Provides utility methods for {@link Map}.
 */
export class Maps {

  private constructor() {
  }

  /**
   * Adds the given value to the multi map.
   */
  public static addMultiValue<K, V>(multiValueMap: Map<K, Set<V>>, key: K, value: V): Map<K, Set<V>> {
    const values = multiValueMap.get(key) || new Set<V>();
    return multiValueMap.set(key, values.add(value));
  }

  /**
   * Removes the given value from the multi map.
   */
  public static removeMultiValue<K, V>(multiValueMap: Map<K, Set<V>>, key: K, value: V): boolean {
    const values = multiValueMap.get(key) || new Set<V>();
    const deleted = values.delete(value);
    if (deleted && !values.size) {
      multiValueMap.delete(key);
    }
    return deleted;
  }

  /**
   * Tests if the given value is contained in the multi map.
   */
  public static hasMultiValue<K, V>(multiValueMap: Map<K, Set<V>>, key: K, value: V): boolean {
    return (multiValueMap.get(key) || new Set<V>()).has(value);
  }
}
