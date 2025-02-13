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
