/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform, Predicate} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';

/**
 * Filters items that match the given predicate.
 */
@Pipe({name: 'wbFilterByPredicate', standalone: true})
export class FilterByPredicatePipe implements PipeTransform {

  public transform<T>(items: T[] | null | undefined, predicate: Predicate<T>): T[] {
    return Arrays.coerce(items).filter(predicate);
  }
}
