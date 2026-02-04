/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Provides helper functions for working with objects.
 */
export const Objects = {

  /**
   * Like {@link Object.keys}, but preserving the data type of keys.
   */
  keys: <T, P extends keyof T>(object: T): P[] => {
    return Object.keys(object as Record<P, unknown>) as Array<P>;
  },

  /**
   * Like {@link Object.values}, but preserving the data type of values and supporting optional properties.
   */
  values: <T, P extends keyof T>(object: T): Array<T[P]> => {
    return Object.values(object as Record<P, T[P]>);
  },

  /**
   * Like {@link Object.entries}, but preserving the data type of keys and supporting optional properties.
   */
  entries: <T, P extends keyof T>(object: T): Array<[P, T[P]]> => {
    return Object.entries(object as Record<P, T[P]>) as Array<[P, T[P]]>;
  },

  /**
   * Stringifies given object to matrix notation: a=b;c=d;e=f
   */
  toMatrixNotation: (object: Record<string, unknown> | null | undefined): string => {
    return Object.entries(object ?? {}).map(([key, value]) => `${key}=${value}`).join(';');
  },
  /**
   * Compares two objects for deep equality, ignoring property order.
   */
  isEqual: (a: unknown, b: unknown): boolean => {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    if (typeof a !== 'object' || typeof b !== 'object') {
      return false;
    }

    if (a instanceof Map || b instanceof Map) {
      if (!(a instanceof Map) || !(b instanceof Map)) {
        return false;
      }

      if (a.size !== b.size) {
        return false;
      }

      return [...a.entries()].every(([key, value]) => b.has(key) && Objects.isEqual(value, b.get(key)));
    }

    if (a instanceof Set || b instanceof Set) {
      if (!(a instanceof Set) || !(b instanceof Set)) {
        return false;
      }

      if (a.size !== b.size) {
        return false;
      }

      return [...a].every(value => [...b].some(other => Objects.isEqual(value, other)));
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
      return false;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every(key => Objects.isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  },
} as const;
