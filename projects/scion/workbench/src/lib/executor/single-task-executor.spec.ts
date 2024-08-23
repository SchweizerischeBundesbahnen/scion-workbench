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
import {createEnvironmentInjector, EnvironmentInjector, runInInjectionContext} from '@angular/core';
import {SingleTaskExecutor} from './single-task-executor';

describe('SingleTaskExecutor', () => {

  it('should execute tasks in serial order', async () => {
    const executor = TestBed.runInInjectionContext(() => new SingleTaskExecutor());

    const completeTask1$ = new Subject<void>();
    const completeTask2$ = new Subject<void>();
    const executionLog = new Array<string>();

    // Submit task 1.
    const task1 = executor.submit(async () => {
      executionLog.push('task 1');
      await firstValueFrom(completeTask1$);
      return 'task 1 completed';
    });

    // Submit task 2.
    const task2 = executor.submit(async () => {
      executionLog.push('task 2');
      await firstValueFrom(completeTask2$);
      return 'task 2 completed';
    });

    // Submit task 3.
    const task3 = executor.submit(async () => {
      executionLog.push('task 3');
      return 'task 3 completed';
    });

    // Wait for task 1 to be executed.
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1']);
    await expectAsync(task1).toBePending();
    await expectAsync(task2).toBePending();
    await expectAsync(task3).toBePending();

    // Complete task 1.
    completeTask1$.next();
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1', 'task 2']);
    await expectAsync(task1).toBeResolvedTo('task 1 completed');
    await expectAsync(task2).toBePending();
    await expectAsync(task3).toBePending();

    // Complete task 2.
    completeTask2$.next();
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1', 'task 2', 'task 3']);
    await expectAsync(task1).toBeResolvedTo('task 1 completed');
    await expectAsync(task2).toBeResolvedTo('task 2 completed');
    await expectAsync(task3).toBeResolvedTo('task 3 completed');
  });

  it('should destroy executor when destroying injector', async () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const executor = runInInjectionContext(injector, () => new SingleTaskExecutor());

    const completeTask1$ = new Subject<void>();
    const executionLog = new Array<string>();

    // Submit task 1.
    const task1 = executor.submit(async () => {
      executionLog.push('task 1');
      await firstValueFrom(completeTask1$);
    });

    // Submit task 2.
    const task2 = executor.submit(async () => {
      executionLog.push('task 2');
    });

    // Wait for task 1 to be executed.
    await firstValueFrom(timer(100));
    expect(executionLog).toEqual(['task 1']);
    await expectAsync(task1).toBePending();
    await expectAsync(task2).toBePending();

    // Destroy injector.
    injector.destroy();

    // Complete task 1.
    completeTask1$.next();
    await firstValueFrom(timer(100));

    // Expect task 2 not to be executed.
    expect(executionLog).toEqual(['task 1']);
    await expectAsync(task1).toBeResolved();
    await expectAsync(task2).toBePending();
  });
});
