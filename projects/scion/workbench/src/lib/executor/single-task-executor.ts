/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AsyncSubject, Subject} from 'rxjs';
import {serializeExecution} from '../operators';
import {catchError, takeUntil} from 'rxjs/operators';

/**
 * Allows the serial execution of tasks.
 *
 * At any given time, there is only one task executing. When submitting a task and if there is a task already executing,
 * the submitted task will be queued for later execution.
 */
export class SingleTaskExecutor {

  private _task$ = new Subject<Task>();
  private _destroy$ = new Subject<void>();

  constructor() {
    this._task$
      .pipe(
        serializeExecution(task => task.execute()),
        catchError((error, caught) => caught),
        takeUntil(this._destroy$),
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

  /**
   * Destroys this executor.
   */
  public destroy(): void {
    this._destroy$.next();
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
    return this._done$.toPromise();
  }
}
