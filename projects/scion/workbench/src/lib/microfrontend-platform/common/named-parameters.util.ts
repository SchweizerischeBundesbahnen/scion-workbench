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
 * Provides helper functions for named parameters.
 */
export const NamedParameters = {
  /**
   * Replaces named parameters in the given value with values contained in the given {@link Map}.
   * Named parameters begin with a colon (`:`).
   */
  substitute: substitute,
} as const;

function substitute(value: string, params?: Map<string, unknown>): string;
function substitute(value: string | null, params?: Map<string, unknown>): string | null;
function substitute(value: string | undefined, params?: Map<string, unknown>): string | undefined;
function substitute(value: string | null | undefined, params?: Map<string, unknown>): string | null | undefined {
  if (!value || !params?.size) {
    return value;
  }
  return [...params].reduce((acc, [paramKey, paramValue]) => {
    if (paramValue === undefined) {
      return acc;
    }
    return acc.replaceAll(`:${paramKey}`, `${paramValue}`);
  }, value);
}
