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
 * Concats the given arrays.
 *
 * Usage: `array | wbConcatArray:array1:array2:array3`
 */
@Pipe({name: 'appConcatArray', standalone: true})
export class ArrayConcatPipe implements PipeTransform {

  public transform(input: string[], ...arrays: Array<string[] | string | undefined | null>): string[] {
    return arrays.reduce(
      (acc: string[], array: string[] | string | undefined | null): string[] => acc.concat(array ?? []),
      input,
    );
  }
}
