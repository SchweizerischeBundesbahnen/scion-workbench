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
import {undefinedIfEmpty} from './undefined-if-empty.util';

/**
 * Returns `null` if the given object is empty.
 */
@Pipe({name: 'appNullIfEmpty'})
export class NullIfEmptyPipe implements PipeTransform {

  public transform<T>(value: T): T | null {
    return undefinedIfEmpty(value) ?? null;
  }
}
