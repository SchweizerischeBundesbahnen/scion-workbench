/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {asapScheduler, AsyncSubject, lastValueFrom, Subject} from 'rxjs';
import {serializeExecution} from '../common/operators';
import {catchError, observeOn} from 'rxjs/operators';
import {InjectionToken} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Serializes navigation requests to the Angular Router to prevent the cancellation of previously initiated asynchronous navigations.
 */
export const ANGULAR_ROUTER_MUTEX = new InjectionToken<SingleTaskExecutor>('ANGULAR_ROUTER_MUTEX', {
  providedIn: 'root',
  factory: () => new SingleTaskExecutor(),
});

/**
 * Allows the serial execution of tasks.
 *
 * At any one time, there is only one task executing. When submitting a task and if there is a task already executing,
 * the submitted task will be queued for later execution.
 *
 * This executor must be constructed within an injection context. Destroying the injection context will also destroy the executor.
 */
export class SingleTaskExecutor {

  private _task$ = new Subject<Task>();

  constructor() {
    this._task$
      .pipe(
        // Schedule the task asynchronously so that it is not executed if the executor is destroyed in the same "call stack",
        // happening, for example, when destroying the Testbed in unit tests. Angular destroys contexts from the bottom up,
        // i.e., child contexts are destroyed before parent contexts. If a task is scheduled in a destroy lifecycle hook of
        // a child context, the task would still be executed because the executor is not destroyed yet.
        observeOn(asapScheduler),
        serializeExecution(task => task.execute()),
        catchError((error, caught) => caught),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * Submits a task for serial execution.
   *
   * Returns a Promise that resolves to the result of the passed task.
   */
  public submit<T>(task: () => Promise<T>): Promise<T> {
    const ɵtask = new Task<T>(task);
    this._task$.next(ɵtask);
    return ɵtask.await();
  }
}

class Task<T = any> {

  private _done$ = new AsyncSubject<T>();

  constructor(private _work: () => Promise<T>) {
  }

  public async execute(): Promise<void> {
    try {
      const result = await this._work();
      this._done$.next(result);
      this._done$.complete();
    }
    catch (error) {
      this._done$.error(error);
    }
  }

  public await(): Promise<T> {
    return lastValueFrom(this._done$);
  }
}
