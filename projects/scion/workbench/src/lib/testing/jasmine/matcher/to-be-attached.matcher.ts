/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcherResult = jasmine.CustomMatcherResult;
import CustomAsyncMatcher = jasmine.CustomAsyncMatcher;
import {DebugElement} from '@angular/core';
import {retryOnError} from '@scion/toolkit/testing';

/**
 * Provides the implementation of {@link CustomAsyncMatcherFactories#toBeAttached}.
 */
export const toBeAttachedCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toBeAttached: (): CustomAsyncMatcher => {
    return {
      async compare(actual: () => DebugElement | undefined | null, failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            const nativeElement = actual()?.nativeElement as HTMLElement | undefined;
            const isConnected = nativeElement?.isConnected ?? false;
            if (!isConnected) {
              throw Error('[DOMAssertError Expected element to be attached, but was not.');
            }
          });

          return pass();
        }
        catch (error) {
          return fail(error instanceof Error ? error.message : `${error}`);
        }

        function pass(): CustomMatcherResult {
          return {pass: true};
        }

        function fail(message: string): CustomMatcherResult {
          return {pass: false, message: message.concat(failOutput ? ` (${failOutput})` : '')};
        }
      },
      async negativeCompare(actual: () => DebugElement | undefined | null, failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            const nativeElement = actual()?.nativeElement as HTMLElement | undefined;
            const isConnected = nativeElement?.isConnected ?? false;
            if (isConnected) {
              throw Error('[DOMAssertError Expected element not to be attached, but was.');
            }
          });

          return pass();
        }
        catch (error) {
          return fail(error instanceof Error ? error.message : `${error}`);
        }

        function pass(): CustomMatcherResult {
          return {pass: true};
        }

        function fail(message: string): CustomMatcherResult {
          return {pass: false, message: message.concat(failOutput ? ` (${failOutput})` : '')};
        }
      },
    };
  },
};
