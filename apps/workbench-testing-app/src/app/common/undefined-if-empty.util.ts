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
export function undefinedIfEmpty<T>(value: T | null | undefined): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  else if (value instanceof Map || value instanceof Set) {
    return value.size ? value : undefined;
  }
  else if (Array.isArray(value) || typeof value === 'string') {
    return value.length ? value : undefined;
  }
  else if (typeof value === 'object') {
    // Consider empty if no properties or only `undefined` properties.
    return Object.values(value).some(value => value !== undefined) ? value : undefined;
  }
  return value;
}
