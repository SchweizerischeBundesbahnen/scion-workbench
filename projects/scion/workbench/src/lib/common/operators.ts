/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable, OperatorFunction} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

/**
 * Serializes the execution of elements emitted by the source Observable.
 *
 * For each element emitted by the source, the specified callback function is called.
 * The next element will only be processed once the Promise or Observable returned by
 * the callback function resolves or completes.
 */
export function serializeExecution<IN, OUT>(fn: (value: IN) => Observable<OUT> | Promise<OUT>): OperatorFunction<IN, OUT> {
  return mergeMap(element => fn(element), 1);
}
