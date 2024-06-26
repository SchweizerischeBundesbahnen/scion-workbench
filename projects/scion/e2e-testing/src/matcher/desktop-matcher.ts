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
import {WorkbenchDesktopPagePO} from '../workbench/workbench-desktop.po';

/**
 * Asserts state and presence of a desktop.
 */
export function expectDesktop(desktopPage: WorkbenchDesktopPagePO): DesktopMatcher {
  return expectWorkbenchDesktop(desktopPage);
}

/**
 * Returns a {@link DesktopMatcher} to expect the workbench desktop.
 */
function expectWorkbenchDesktop(desktopPage: WorkbenchDesktopPagePO): DesktopMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(desktopPage.desktop.locator).toBeVisible();
      await expect(desktopPage.locator).toBeVisible();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(desktopPage.desktop.locator).not.toBeAttached();
        await expect(desktopPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a desktop.
 */
export interface DesktopMatcher {
  /**
   * Expects the desktop to be visible.
   */
  toBeVisible(): Promise<void>;

  not: {
    /**
     * Expects the desktop not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
