/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * Returns a new {@link Map} with the actual data type of each parameter appended to its value in square brackets.
 *
 * Examples:
 * - `Jack [string]`
 * - `1234 [number]`
 * - `true [boolean]`
 * - `null [null]`
 * - `undefined [undefined]`
 */
@Pipe({name: 'appAppendParamDataType', standalone: true})
export class AppendParamDataTypePipe implements PipeTransform {

  public transform(params: ReadonlyMap<string, any> | null): ReadonlyMap<string, any> {
    if (params === null) {
      return null;
    }
    return Array.from(params.entries()).reduce((acc, [key, value]) => {
      return acc.set(key, `${value} [${typeOf(value)}]`);
    }, new Map());
  }
}

function typeOf(value: any): string {
  if (value === null) {
    return 'null';
  }
  return typeof value;
}
