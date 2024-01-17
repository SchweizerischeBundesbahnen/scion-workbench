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
 * Tests if the object is of the specified type.
 */
@Pipe({name: 'wbTypeof', standalone: true})
export class TypeofPipe implements PipeTransform {

  public transform<T>(object: T, type: 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'symbol' | 'function' | 'bigint'): object is T {
    return typeof object === type;
  }
}
