/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';


/**
 * Returns `null` if the given object is empty.
 */
@Pipe({name: 'wbNullIfEmpty', standalone: true})
export class NullIfEmptyPipe implements PipeTransform {

  public transform<T>(value: T): T | null {
    if (value === null || value === undefined) {
      return null;
    }
    else if (value instanceof Map || value instanceof Set) {
      return value.size ? value : null;
    }
    else if (Array.isArray(value) || typeof value === 'string') {
      return value.length ? value : null;
    }
    else if (typeof value === 'object') {
      return Object.keys(value).length ? value : null;
    }
    return value;
  }
}
