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

@Pipe({name: 'appIterable', standalone: true})
export class IterablePipe implements PipeTransform {

  public transform(number: number): Iterable<number> {
    return new Array(number).fill(undefined).map((_, index) => index + 1);
  }
}
