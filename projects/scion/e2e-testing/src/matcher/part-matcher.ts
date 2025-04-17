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
import {PartPO} from '../part.po';

/**
 * Asserts state and presence of a part.
 */
export function expectPart(part: PartPO): PartMatcher {
  return {
    toDisplayComponent: async (selector: string): Promise<void> => {
      await expect(part.locator).toBeVisible();
      await expect(part.locator.locator('.e2e-part-content').locator(selector)).toBeVisible();
      await expect(part.locator.locator('.e2e-view-content')).not.toBeVisible();
    },
    not: {
      toDisplayComponent: async (): Promise<void> => {
        await expect(part.locator).toBeVisible();
        await expect(part.locator.locator('.e2e-part-content')).not.toBeAttached();
        await expect(part.locator.locator('.e2e-view-content')).toBeVisible();
      },
      toBeAttached: async (): Promise<void> => {
        await expect(part.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a part.
 */
export interface PartMatcher {
  /**
   * Expects the part to display the specified component.
   */
  toDisplayComponent(selector: string): Promise<void>;

  not: {
    /**
     * Expects the part not to display any component.
     */
    toDisplayComponent(): Promise<void>;
    /**
     * Expects the part not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
