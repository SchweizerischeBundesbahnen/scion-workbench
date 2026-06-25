/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {firstValueFrom, timer} from 'rxjs';

/**
 * Executes the given function, retrying execution if it throws an error. If the maximum timeout is exceeded, the error is re-thrown.
 *
 * @returns Promise that resolves to the result of the function.
 */
export async function retryOnError<T>(fn: () => Promise<T> | T, options?: {timeout?: number; interval?: number}): Promise<T> {
  const timeout = options?.timeout ?? 2000;
  const interval = options?.interval ?? 100;
  const t0 = Date.now();

  while (true) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    try {
      return await fn();
    }
    catch (error) {
      if (Date.now() - t0 > timeout) {
        throw error;
      }
    }

    await firstValueFrom(timer(interval));
  }
}
