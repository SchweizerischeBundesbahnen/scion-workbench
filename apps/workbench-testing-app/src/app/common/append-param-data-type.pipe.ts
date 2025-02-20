/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * Returns a new {@link Map} with the actual data type of each parameter appended to its value in square brackets,
 * unless it is a string data type.
 *
 * Examples:
 * - `abc`
 * - `1234 [number]`
 * - `true [boolean]`
 * - `null [null]`
 * - `undefined [undefined]`
 */
@Pipe({name: 'appAppendParamDataType'})
export class AppendParamDataTypePipe implements PipeTransform {

  public transform(params: Record<string, unknown> | Map<string, unknown> | ReadonlyMap<string, unknown>): Record<string, string> | Map<string, unknown> {
    if (params instanceof Map) {
      return new Map(transformEntries(Array.from(params.entries())));
    }
    else {
      return Object.fromEntries(transformEntries(Object.entries(params)));
    }
  }
}

function transformEntries(entries: Array<[string, unknown]>): Array<[string, string]> {
  return entries.map(([key, value]) => {
    if (typeof value === 'string') {
      return [key, value];
    }
    else {
      return [key, `${value} [${typeOf(value)}]`];
    }
  });
}

function typeOf(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'Array';
  }
  if (value instanceof Map) {
    return 'Map';
  }
  if (value instanceof Set) {
    return 'Set';
  }
  return typeof value;
}
