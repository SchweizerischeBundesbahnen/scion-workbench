/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {WorkbenchPartPagePO} from '../workbench/page-object/workbench-part-page.po';

/**
 * Asserts the display of the part page.
 */
export function expectPartPage(partPage: WorkbenchPartPagePO): PartPageMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(partPage.part.locator).toBeVisible();
      await expect(partPage.locator).toBeVisible();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(partPage.part.locator).not.toBeAttached();
        await expect(partPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts the display of the part page.
 */
export interface PartPageMatcher {
  /**
   * Expects the part page to be visible.
   */
  toBeVisible(): Promise<void>;

  not: {
    /**
     * Expects the part page not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
