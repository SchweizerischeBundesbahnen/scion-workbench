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
import {PartPO} from '../../part.po';
import {AppPO} from '../../app.po';
import {SciRouterOutletPO} from '../page-object/sci-router-outlet.po';

/**
 * Asserts state and presence of a part.
 */
export function expectPart(part: PartPO): PartMatcher {
  return {
    toDisplayComponent: async (selector: string): Promise<void> => {
      const partId = await part.getPartId();
      const appPO = new AppPO(part.locator.page());
      const outlet = new SciRouterOutletPO(appPO, {name: partId});

      await expect(part.locator).toBeVisible();
      await expect(part.locator.locator('.e2e-part-content')).toBeVisible();
      await expect(part.locator.locator('.e2e-view-content')).not.toBeVisible();
      await expect(outlet.locator).toBeVisible();
      await expect(outlet.frameLocator.locator(selector)).toBeVisible();
    },
    not: {
      toDisplayComponent: async (): Promise<void> => {
        const partId = await part.getPartId();
        const appPO = new AppPO(part.locator.page());
        const outlet = new SciRouterOutletPO(appPO, {name: partId});

        await expect(part.locator).toBeVisible();
        await expect(part.locator.locator('.e2e-part-content')).not.toBeAttached();
        await expect(part.locator.locator('.e2e-view-content')).toBeVisible();
        await expect(outlet.locator).not.toBeAttached();
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
     * Expects the part not to display a component, but a view.
     */
    toDisplayComponent(): Promise<void>;
    /**
     * Expects the part not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
