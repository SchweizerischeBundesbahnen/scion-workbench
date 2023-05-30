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
 * Returns an empty array if the array is `null` or `undefined`.
 */
@Pipe({name: 'wbEmptyIfNull', standalone: true})
export class EmptyIfNullPipe implements PipeTransform {

  public transform<T>(value: T[] | null | undefined): T[] {
    return value ?? [];
  }
}
