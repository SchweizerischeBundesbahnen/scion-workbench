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
import {MicrofrontendViewPagePO, WorkbenchViewPagePO} from '../workbench/page-object/workbench-view-page.po';

/**
 * Asserts state and presence of a view.
 */
export function expectView(viewPage: WorkbenchViewPagePO | MicrofrontendViewPagePO): ViewMatcher {
  if (isMicrofrontendView(viewPage)) {
    return expectMicrofrontendView(viewPage);
  }
  return expectWorkbenchView(viewPage);
}

/**
 * Returns a {@link ViewMatcher} to expect the workbench view.
 */
function expectWorkbenchView(viewPage: WorkbenchViewPagePO): ViewMatcher {
  return {
    toBeActive: async (): Promise<void> => {
      await expect(viewPage.view.tab.locator).toBeVisible();
      await expect(viewPage.view.tab.locator).toHaveAttribute('data-active');
      await expect(viewPage.view.locator).toBeVisible();
      await expect(viewPage.locator).toBeVisible();
    },
    toBeInactive: async (options?: {loaded?: boolean}): Promise<void> => {
      if (options?.loaded !== undefined) {
        throw Error(`[PageObjectError] Unsupported option: 'loaded'}`);
      }

      await expect(viewPage.view.tab.locator).toBeVisible();
      await expect(viewPage.view.tab.locator).not.toHaveAttribute('data-active');
      await expect(viewPage.view.locator).not.toBeAttached();
      await expect(viewPage.locator).not.toBeAttached();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(viewPage.view.tab.locator).not.toBeAttached();
        await expect(viewPage.view.locator).not.toBeAttached();
        await expect(viewPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@link ViewMatcher} to expect the microfrontend view.
 */
function expectMicrofrontendView(viewPage: MicrofrontendViewPagePO): ViewMatcher {
  return {
    toBeActive: async (): Promise<void> => {
      await expect(viewPage.view.tab.locator).toBeVisible();
      await expect(viewPage.view.tab.locator).toHaveAttribute('data-active');
      await expect(viewPage.view.locator).toBeVisible();
      await expect(viewPage.outlet.locator).toBeVisible();
      await expect(viewPage.locator).toBeVisible();
    },
    toBeInactive: async (options?: {loaded?: boolean}): Promise<void> => {
      await expect(viewPage.view.tab.locator).toBeVisible();
      await expect(viewPage.view.tab.locator).not.toHaveAttribute('data-active');
      await expect(viewPage.view.locator).not.toBeAttached();
      await expect(viewPage.outlet.locator).toBeAttached();
      await expect(viewPage.outlet.locator).not.toBeVisible();
      await expect(viewPage.locator).toBeVisible({visible: options?.loaded ?? true}); // if loaded, iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => viewPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the view.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(viewPage.view.tab.locator).not.toBeAttached();
        await expect(viewPage.view.locator).not.toBeAttached();
        await expect(viewPage.outlet.locator).not.toBeAttached();
        await expect(viewPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a view.
 */
export interface ViewMatcher {
  /**
   * Expects the view to be the active view in its part.
   */
  toBeActive(): Promise<void>;

  /**
   * Expects the view to be in the DOM but not active, i.e., another view is the active view in its part.
   *
   * @param options - Options to control the expectation.
   * @param options.loaded - Specifies if the microfrontend should be loaded. Defaults to `true`. Option not supported for non-microfrontend views.
   */
  toBeInactive(options?: {loaded?: boolean}): Promise<void>;

  not: {
    /**
     * Expects the view not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendView(viewPage: WorkbenchViewPagePO | MicrofrontendViewPagePO): viewPage is MicrofrontendViewPagePO {
  return !!(viewPage as MicrofrontendViewPagePO).outlet;
}
