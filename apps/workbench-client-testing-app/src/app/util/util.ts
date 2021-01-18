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
 * Returns a new instance with `undefined` entries removed,
 * or returns `undefined` if all entries are `undefined`.
 */
export function undefinedIfEmpty<T>(object: T): T {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    return {...acc, [key]: value};
  }, undefined as T);
}
