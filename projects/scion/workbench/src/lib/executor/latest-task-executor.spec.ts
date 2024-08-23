/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {firstValueFrom, Subject, timer} from 'rxjs';
import {LatestTaskExecutor} from './latest-task-executor';
import {createEnvironmentInjector, EnvironmentInjector, runInInjectionContext} from '@angular/core';

describe('LatestTaskExecutor', () => {

  it('should execute tasks in serial order, debouncing pending tasks', async () => {
    const executor = TestBed.runInInjectionContext(() => new LatestTaskExecutor());

    const completeTask1$ = new Subject<void>();
    const executionLog = new Array<string>();

    // Submit task 1.
    executor.submit(async () => {
      executionLog.push('task 1');
      await firstValueFrom(completeTask1$);
    });

    // Submit task 2.
    executor.submit(async () => {
      executionLog.push('task 2');
    });

    // Submit task 3.
    executor.submit(async () => {
      executionLog.push('task 3');
    });

    // Wait for task 1 to be executed.
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1']);

    // Complete task 1.
    completeTask1$.next();

    // Wait for task 3 to be executed.
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1', 'task 3']);
  });

  it('should destroy executor when destroying injector', async () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const executor = runInInjectionContext(injector, () => new LatestTaskExecutor());

    const completeTask1$ = new Subject<void>();
    const executionLog = new Array<string>();

    // Submit task 1.
    executor.submit(async () => {
      executionLog.push('task 1');
      await firstValueFrom(completeTask1$);
    });

    // Submit task 2.
    executor.submit(async () => {
      executionLog.push('task 2');
    });

    // Wait for task 1 to be executed.
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1']);

    // Destroy injector.
    injector.destroy();

    // Complete task 1.
    completeTask1$.next();
    await firstValueFrom(timer(100));

    // Expect task 2 not to be executed.
    expect(executionLog).toEqual(['task 1']);
  });
});
