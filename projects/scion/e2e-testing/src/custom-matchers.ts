/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect, Locator} from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Tests the array to contain exactly the expected elements in any order.
       */
      toEqualIgnoreOrder(expected: Array<any>): R;

      /**
       * Tests the given element to be visible.
       */
      toBeVisible(locator: Locator): R;
    }
  }
}

/**
 * SCION-specific matchers to be used as expectations.
 *
 * @see https://playwright.dev/docs/test-advanced#add-custom-matchers-using-expectextend
 */
export namespace CustomMatchers {

  /**
   * Installs SCION-specific matchers to be used as expectations.
   */
  export function install(): void {
    expect.extend({

      toEqualIgnoreOrder(actual: unknown, expected: Array<any>): ExpectationResult {
        if (Array.isArray(actual) && actual.length === expected.length && includeSameElements(actual, expected)) {
          return {pass: true};
        }
        return {
          pass: false,
          message: () => `Arrays not equal. Expected [${actual}] to equal [${expected}]`,
        };
      },

      async toBeVisible(element: Locator): Promise<ExpectationResult> {
        try {
          await element.waitFor({state: 'visible', timeout: 5000});
          return {pass: true};
        }
        catch (error) {
          return {
            pass: false, message: () => `Element not visible. Expected element ${element} to be visible.`,
          };
        }
      },
    });
  }
}

function includeSameElements(array1: Array<any>, array2: Array<any>): boolean {
  return array1.every(item => array2.includes(item)) && array2.every(item => array1.includes(item));
}

interface ExpectationResult {
  pass: boolean;
  message?: () => string;
}
