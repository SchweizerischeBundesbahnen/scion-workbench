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
import {FormControl} from '@angular/forms';
import {filterArray} from '@scion/toolkit/operators';
import {expand, map, take} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';
import {Observable, of} from 'rxjs';

/**
 * Filters items that match the text of the given {@link FormControl}.
 */
@Pipe({name: 'wbFilterByText$', standalone: true})
export class FilterByTextPipe implements PipeTransform {

  public transform<T>(items: T[] | null | undefined, filterControl: FormControl<string>, itemTextFn: (item: T) => string | undefined): Observable<T[]> {
    return of(Arrays.coerce(items))
      .pipe(
        expand(it => filterControl.valueChanges.pipe(take(1), map(() => it))),
        filterArray(it => !filterControl.value || !!itemTextFn(it)?.match(toFilterRegExp(filterControl.value))),
      );
  }
}

/**
 * Creates a regular expression of the given filter text.
 */
function toFilterRegExp(filterText: string): RegExp {
  // Escape the user filter input and add wildcard support
  const escapedString = filterText.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  return new RegExp(escapedString, 'i');
}
