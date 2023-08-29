/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {audit, MonoTypeOperatorFunction, Observable, OperatorFunction} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';
import {inject} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';

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

/**
 * Mirrors the source except for `null` emissions.
 */
export function filterNull<T>(): OperatorFunction<T | null, T> {
  return filter((item: T | null): item is T => item !== null);
}

/**
 * Buffers the most recent value from the source Observable until the next layout change.
 * Use this operator to avoid emitting a partially updated layout.
 */
export function bufferLatestUntilLayoutChange<T>(): MonoTypeOperatorFunction<T> {
  const onLayoutChange$ = inject(WorkbenchLayoutService).onLayoutChange$;
  return audit(() => onLayoutChange$);
}
