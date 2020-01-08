/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ApplicationManifest } from './platform.model';
import { Observable, throwError } from 'rxjs';
import { reduce, take, timeoutWith } from 'rxjs/operators';
import { Defined } from '@scion/toolkit/util';

/**
 * Expects the given function to be rejected.
 *
 * Jasmine 3.5 provides 'expectAsync' expectation with the 'toBeRejectedWithError' matcher.
 * But, it does not support to test against a regular expression.
 * @see https://jasmine.github.io/api/3.5/async-matchers.html
 */
export function expectToBeRejectedWithError(promise: Promise<any>, expected?: RegExp): Promise<void> {
  const reasonExtractorFn = (reason: any): string => {
    if (typeof reason === 'string') {
      return reason;
    }
    if (reason instanceof Error) {
      return reason.message;
    }
    return reason.toString();
  };

  return promise
    .then(() => fail('Promise expected to be rejected but was resolved.'))
    .catch(reason => {
      if (expected && !reasonExtractorFn(reason).match(expected)) {
        fail(`Expected promise to be rejected with a reason matching '${expected.source}', but was '${reason}'.`);
      }
      else {
        expect(true).toBeTruthy();
      }
    });
}

/**
 * Expects the resolved map to contain at least the given map entries.
 *
 * Jasmine 3.5 provides 'mapContaining' matcher.
 */
export function expectMap(actual: Promise<Map<any, any>>): ToContainMatcher & { not: ToContainMatcher } {
  return {
    toContain: async (expected: Map<any, any>): Promise<void> => {
      const expectedTuples = [...expected];
      const actualTuples = [...await actual];
      await expect(actualTuples).toEqual(jasmine.arrayContaining(expectedTuples));
    },
    not: {
      toContain: async function (expected: Map<any, any>): Promise<void> {
        const expectedTuples = [...expected];
        const actualTuples = [...await actual];
        await expect(actualTuples).not.toEqual(jasmine.arrayContaining(expectedTuples));
      },
    },
  };
}

export interface ToContainMatcher {
  toContain(expected: Map<any, any>): Promise<void>;
}

/***
 * Serves the given manifest and returns the URL where the manifest is served.
 */
export function serveManifest(manifest: Partial<ApplicationManifest>): string {
  return URL.createObjectURL(new Blob([JSON.stringify(manifest)], {type: 'application/json'}));
}

/**
 * Returns a Promise that resolves after the given millis elapses.
 */
export function waitFor(millis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millis)); // tslint:disable-line:typedef
}

/**
 * Returns a Promise that resolves when the condition returns `true` or that rejects when the timeout expires.
 */
export function waitForCondition(condition: () => boolean, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {  // tslint:disable-line:typedef
    const expiryDate = Date.now() + timeout;

    const periodicConditionCheckerFn = (): void => {
      if (condition()) {
        resolve();
      }
      else if (Date.now() > expiryDate) {
        reject(`[SpecTimeoutError] Timeout elapsed. Condition not fulfilled within ${timeout}ms.`);
      }
      else {
        setTimeout(periodicConditionCheckerFn, 10);
      }
    };
    periodicConditionCheckerFn();
  });
}

/**
 * Subscribes to the given {@link Observable} and resolves to the emitted messages.
 */
export function collectToPromise<T, R = T>(observable$: Observable<T>, options: { take: number, timeout?: number, projectFn?: (msg: T) => R }): Promise<R[]> {
  const timeout = Defined.orElse(options.timeout, 1000);
  return observable$
    .pipe(
      take(options.take),
      timeoutWith(new Date(Date.now() + timeout), throwError('[SpecTimeoutError] Timeout elapsed.')),
      reduce((collected, item) => collected.concat(options.projectFn ? options.projectFn(item) : item), []),
    )
    .toPromise();
}
