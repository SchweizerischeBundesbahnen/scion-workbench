/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Mutates the passed object by recursively deleting `undefined` properties, optionally also pruning empty objects.
 *
 * By default, empty objects are retained.
 *
 * @returns Pruned object or `undefined` depending on options.
 */
export function prune<T>(object: T): T;
export function prune<T>(object: T, options: {pruneIfEmpty: true}): T | undefined;
export function prune<T>(object: T, options?: {pruneIfEmpty: boolean}): T | undefined;
export function prune<T>(object: T, options?: {pruneIfEmpty: boolean}): T | undefined {
  const pruneIfEmpty = options?.pruneIfEmpty ?? false;

  if (object === null || object instanceof Map || object instanceof Set || Array.isArray(object)) {
    return object;
  }

  if (typeof object === 'object') {
    Object.entries(object).forEach(([key, value]) => {
      if (prune(value, {pruneIfEmpty}) === undefined) {
        delete (object as Record<string, unknown>)[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
    });
    if (!Object.keys(object).length && pruneIfEmpty) {
      return undefined;
    }
  }
  return object;
}
