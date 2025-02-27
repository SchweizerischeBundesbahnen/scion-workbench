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
 * Creates a textual representation from a given object.
 */
@Pipe({name: 'appStringify'})
export class StringifyPipe implements PipeTransform {

  public transform(object: unknown): string {
    if (object === null) {
      return `null`;
    }
    if (object === undefined) {
      return `undefined`;
    }
    if (typeof object === 'string') {
      return object;
    }
    if (typeof object === 'number' || typeof object === 'boolean') {
      return `${object}`;
    }
    if (typeof object === 'function') {
      return object.toString();
    }
    if (object instanceof Map) {
      return Array.from<string[]>(object)
        .sort(([key1], [key2]) => key1.localeCompare(key2))
        .map(([key, value]) => `{"${key}" => ${JSON.stringify(value)}}`)
        .join('\n')
        .trim();
    }

    try {
      return JSON.stringify(object);
    }
    catch {
      // noop
    }
    return object.toString();
  }
}
