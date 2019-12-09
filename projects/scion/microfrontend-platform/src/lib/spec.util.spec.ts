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
export async function expectToBeResolvedToMapContaining(actual: Promise<Map<any, any>>, expected: Map<any, any>): Promise<void> {
  const expectedTuples = [...expected];
  const actualTuples = [...await actual];
  await expect(actualTuples).toEqual(jasmine.arrayContaining(expectedTuples));
}

/***
 * Serves the given manifest and returns the URL where the manifest is served.
 */
export function serveManifest(manifest: Partial<ApplicationManifest>): string {
  return URL.createObjectURL(new Blob([JSON.stringify(manifest)], {type: 'application/json'}));
}
