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
import { HttpClient } from './host/http-client';
import { Beans } from './bean-manager';

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

/***
 * Serves the given manifest and returns the URL where the manifest is served. By default, it is served under the current origin.
 */
export function createManifestURL(manifest: Partial<ApplicationManifest>, config?: { origin: string }): string {
  const manifestUrl = new URL('url', config && config.origin || window.location.origin).toString();
  const response: Partial<Response> = {
    ok: true,
    json: (): Promise<any> => Promise.resolve(manifest),
  };

  const httpClientSpy = jasmine.createSpyObj(HttpClient.name, ['fetch']);
  httpClientSpy.fetch.withArgs(manifestUrl).and.returnValue(response);
  Beans.register(HttpClient, {useValue: httpClientSpy});
  return manifestUrl;
}
