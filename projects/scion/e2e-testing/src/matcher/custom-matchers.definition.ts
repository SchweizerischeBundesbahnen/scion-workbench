/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {toEqualIgnoreOrder} from './to-equal-ignore-order.matcher';
import {ExpectedWorkbenchLayout, toEqualWorkbenchLayout} from './to-equal-workbench-layout.matcher';
import {toBeBetween} from './to-be-between.matcher';

/**
 * Extends the Playwright expect API with project specific custom matchers.
 */
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Tests the array to contain exactly the expected elements in any order.
       */
      toEqualIgnoreOrder(expected: Array<any>): R;

      /**
       * Tests the number to be between the expected numbers (inclusive).
       */
      toBeBetween(expectedFrom: number, expectedTo: number): R;

      /**
       * Expects the workbench to have expected layout.
       *
       * Note that properties not specified in the `expected` object are excluded from the assertion.
       *
       * ---
       * Usage:
       *
       * ```ts
       * await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
       *   mainAreaGrid: {
       *     root: new MTreeNode({
       *       direction: 'row',
       *       ratio: .25,
       *       child1: new MPart({id: 'A', views: [{id: 'view.1'}]}),
       *       child2: new MPart({id: 'B', views: [{id: 'view.2'}, {id: 'view.3'}]}),
       *     }),
       *   },
       * });
       * ```
       */
      toEqualWorkbenchLayout(expected: ExpectedWorkbenchLayout): Promise<R>;
    }
  }
}

/**
 * Provides SCION-specific matchers to be used as expectations.
 *
 * @see https://playwright.dev/docs/test-advanced#add-custom-matchers-using-expectextend
 */
export namespace CustomMatchers {

  /**
   * Installs SCION-specific matchers to be used as expectations.
   */
  export function install(): void {
    expect.extend({
      toEqualIgnoreOrder,
      toEqualWorkbenchLayout,
      toBeBetween,
    });
  }
}

/**
 * Represents the result of a matcher.
 */
export interface ExpectationResult {
  pass: boolean;
  message: () => string;
}
