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
import { Observable } from 'rxjs';
import { Observables } from '@scion/toolkit/util';

/**
 * Creates an `Observable` from the given value, or returns the value if already an `Observable`.
 * If given a `Promise`, it is converted into an `Observable`.
 */
@Pipe({name: 'wbCoerceObservable$'})
export class CoerceObservablePipe implements PipeTransform {

  public transform<T>(value: T | Observable<T>): Observable<T> {
    return Observables.coerce(value);
  }
}
