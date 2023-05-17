/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Returns `undefined` if given object is empty.
 */
export function undefinedIfEmpty<T>(object: T | null | undefined): T | undefined {
  if (object === undefined || object === null) {
    return undefined;
  }
  if (typeof object === 'string' && !object.length) {
    return undefined;
  }
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    return {...acc, [key]: value};
  }, undefined as T);
}
