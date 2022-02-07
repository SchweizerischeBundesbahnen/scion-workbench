/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Expects the given Promise to either resolve or reject.
 *
 * Prefer this expectation over Jasmine `expectAsync` as we experienced unexpected behavior. The `expectAsync` expectation was added to Jasmine in version 3.5.
 *
 * - Jasmine `toBeRejectedWithError` matcher does not support to test against a regular expression if the error is not of type 'Error'
 * - Jasmine `toBeResolved` sometimes does not wait for the Promise to resolve. We did not investigate this further.
 *
 * @see https://jasmine.github.io/api/3.5/async-matchers.html
 */
export function expectPromise(actual: Promise<any>): PromiseMatcher {
  return {
    toResolve: async (expected?: any): Promise<void> => {
      try {
        const value = await actual;
        if (expected !== undefined) {
          expect(value).toEqual(expected);
        }
        else {
          expect(true).toBe(true);
        }
      }
      catch (reason) {
        fail(`Promise expected to be resolved but was rejected: ${reason}`);
      }
    },
    toReject: async (expected?: RegExp): Promise<void> => {
      try {
        const value = await actual;
        fail(`Promise expected to be rejected but was resolved: ${value}`);
      }
      catch (reason) {
        const expectedErrorMessage = expected && (typeof reason === 'string' ? reason : (reason instanceof Error ? reason.message : reason.toString()));
        if (expectedErrorMessage && !expectedErrorMessage.match(expected)) {
          fail(`Expected promise to be rejected with a reason matching '${expected.source}', but was '${expectedErrorMessage}'.`);
        }
        else {
          expect(true).toBe(true);
        }
      }
    },
  };
}

export interface PromiseMatcher {
  /**
   * Expects the Promise to resolve. If passing an expected value, also performs an equality test.
   * You can wrap your expectation inside the `objectContaining` or `mapContaining` matcher to test for partial equality.
   */
  toResolve(expected?: any): Promise<void>;

  /**
   * Expects the Promise to reject. If passing a regular expression, also tests the error to match the regex.
   */
  toReject(expected?: RegExp): Promise<void>;
}
