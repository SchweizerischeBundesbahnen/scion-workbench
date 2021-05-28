/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns the value, if an array, or adds it to an array. If `null` or `undefined` is given, returns an empty array.
 */
@Pipe({name: 'wbCoerceArray', pure: true})
export class ArrayCoercePipe implements PipeTransform {

  public transform<T>(arrayLike: T | T[] | null | undefined): T[] {
    if (arrayLike === null || arrayLike === undefined) {
      return [];
    }
    return Array.isArray(arrayLike) ? arrayLike : [arrayLike];
  }
}
