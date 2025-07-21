/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {DesktopPO} from '../desktop.po';

/**
 * Asserts state and presence of the desktop.
 */
export function expectDesktop(desktop: DesktopPO): DesktopMatcher {
  return {
    toDisplayComponent: async (selector: string): Promise<void> => {
      await expect(desktop.locator).toBeVisible();
      await expect(desktop.locator.locator(selector)).toBeVisible();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(desktop.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of the desktop.
 */
export interface DesktopMatcher {
  /**
   * Expects the desktop to display the specified component.
   */
  toDisplayComponent(selector: string): Promise<void>;

  not: {
    /**
     * Expects the desktop not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
