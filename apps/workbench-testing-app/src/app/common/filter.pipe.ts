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
import {FormControl} from '@angular/forms';
import {filterArray} from '@scion/toolkit/operators';
import {expand, map, take} from 'rxjs/operators';
import {toFilterRegExp} from '@scion/components.internal/filter-field';
import {Arrays} from '@scion/toolkit/util';
import {Observable, of} from 'rxjs';

/**
 * Filters elements that match the text of the passed filter control.
 */
@Pipe({name: 'appFilter$', standalone: true})
export class FilterPipe implements PipeTransform {

  public transform<T>(items: T[] | null | undefined, filterControl: FormControl<string>, itemTextFn: (item: T) => string | undefined): Observable<T[]> {
    return of(Arrays.coerce(items))
      .pipe(
        expand(item => filterControl.valueChanges.pipe(take(1), map(() => item))),
        filterArray(item => !filterControl.value || !!itemTextFn(item)?.match(toFilterRegExp(filterControl.value)!)),
      );
  }
}
