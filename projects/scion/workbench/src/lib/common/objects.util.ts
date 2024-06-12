/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionaries} from '@scion/toolkit/util';

/**
 * Provides helper functions for working with objects.
 */
export const Objects = {

  /**
   * Like {@link Object.keys}, but preserving the data type of keys.
   */
  keys: <T>(object: T): Array<keyof T> => {
    return Object.keys(object as Record<keyof T, unknown>) as Array<keyof T>;
  },

  /**
   * Like {@link Object.entries}, but preserving the data type of keys.
   */
  entries: <V, K = string>(object: Record<string, V> | ArrayLike<V>): Array<[K, V]> => {
    return Object.entries(object) as Array<[K, V]>;
  },

  /**
   * Like {@link Dictionaries.withoutUndefinedEntries}, but preserving the object data type.
   */
  withoutUndefinedEntries: <T>(object: T & Record<string, unknown>): T => {
    return Dictionaries.withoutUndefinedEntries(object) as T;
  },
  /**
   * Stringifies given object to matrix notation: a=b;c=d;e=f
   */
  toMatrixNotation: (object: Record<string, unknown> | null | undefined): string => {
    return Object.entries(object ?? {}).map(([key, value]) => `${key}=${value}`).join(';');
  },
} as const;
