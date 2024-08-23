/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, inject} from '@angular/core';

/**
 * Executes submitted tasks in serial order.
 *
 * Unlike {@link SingleTaskExecutor}, this executor has a queue size of 1, with only the most recently scheduled task being queued.
 *
 * Tasks are executed in serial order. At any one time, there is only one task executing and a maximum of one task pending.
 * When a task is submitted and there is a task already executing, the submitted task will be queued for later execution.
 * Any task previously placed in the queue is discarded.
 *
 * This executor must be constructed within an injection context. Destroying the injection context will also destroy the executor.
 */
export class LatestTaskExecutor {

  private _executing = false;
  private _latestTask: (() => Promise<void>) | undefined;

  constructor() {
    // Clear pending tasks when the current injection context is destroyed.
    inject(DestroyRef).onDestroy(() => this.onDestroy());
  }

  /**
   * Submits a task for serial execution.
   */
  public submit(task: () => Promise<void>): void {
    this._latestTask = task;
    this.executeLatestTask();
  }

  /**
   * Executes the last task in the queue (if any).
   * After completion, this process is repeated until the task queue is empty.
   */
  private executeLatestTask(): void {
    if (this._executing || !this._latestTask) {
      return;
    }

    const task = this._latestTask;
    this._latestTask = undefined;

    this._executing = true;
    task().finally(() => {
      this._executing = false;
      this.executeLatestTask();
    });
  }

  private onDestroy(): void {
    this._latestTask = undefined;
  }
}
