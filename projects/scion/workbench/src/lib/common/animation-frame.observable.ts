/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable, Subject} from 'rxjs';
import {inject, NgZone} from '@angular/core';
import {startWith} from 'rxjs/operators';
import {observeIn} from '@scion/toolkit/operators';

/**
 * Creates an observable that emits on every animation frame.
 *
 * Unlike {@link `interval(0, animationFrameScheduler)`}, the observable always emits outside the Angular zone.
 *
 * The RxJS `animationFrameScheduler` does not necessarily execute in the current execution context, such as inside or outside Angular.
 * The scheduler always executes tasks in the zone where the scheduler was first used in the application.
 */
export function onEveryAnimationFrame$(): Observable<void> {
  const zone = inject(NgZone);
  return new Observable<void>(observer => {
    const animationFrame$ = new Subject<void>();
    const subscription = animationFrame$
      .pipe(
        startWith(undefined as void),
        observeIn(fn => zone.runOutsideAngular(fn)),
      )
      .subscribe(() => {
        requestAnimationFrame(() => {
          observer.next();
          animationFrame$.next();
        });
      });

    return () => subscription.unsubscribe();
  });
}
