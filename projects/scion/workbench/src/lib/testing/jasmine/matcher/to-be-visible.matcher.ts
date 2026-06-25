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
import {retryOnError} from './testing.util';
import {DebugElement} from '@angular/core';

/**
 * Provides the implementation of {@link CustomAsyncMatcherFactories#toBeVisible}.
 */
export const toBeVisibleCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toBeVisible: (): CustomAsyncMatcher => {
    return {
      async compare(actual: () => DebugElement | undefined | null, failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            const nativeElement = actual()?.nativeElement as HTMLElement | undefined;
            const visible = nativeElement?.checkVisibility({visibilityProperty: true}) ?? false;
            if (!visible) {
              throw Error('[DOMAssertError Expected element to be visible, but was not.');
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
            const visible = nativeElement?.checkVisibility({visibilityProperty: true}) ?? false;
            if (visible) {
              throw Error('[DOMAssertError Expected element not to be visible, but was.');
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
