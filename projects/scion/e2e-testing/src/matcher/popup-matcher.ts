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
import {MicrofrontendPopupPagePO, WorkbenchPopupPagePO} from '../workbench/page-object/workbench-popup-page.po';

/**
 * Asserts state and presence of a popup.
 */
export function expectPopup(popupPage: WorkbenchPopupPagePO | MicrofrontendPopupPagePO): PopupMatcher {
  if (isMicrofrontendPopup(popupPage)) {
    return expectMicrofrontendPopup(popupPage);
  }
  return expectWorkbenchPopup(popupPage);
}

/**
 * Returns a {@PopupMatcher} to expect the workbench popup.
 */
function expectWorkbenchPopup(popupPage: WorkbenchPopupPagePO): PopupMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeVisible();
      await expect(popupPage.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeAttached();
      await expect(popupPage.popup.locator).not.toBeVisible();
      await expect(popupPage.locator).toBeAttached();
      await expect(popupPage.locator).not.toBeVisible();
      await expect.poll(() => popupPage.popup.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(popupPage.popup.locator).not.toBeAttached();
        await expect(popupPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@PopupMatcher} to expect the microfrontend popup.
 */
function expectMicrofrontendPopup(popupPage: MicrofrontendPopupPagePO): PopupMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeVisible();
      await expect(popupPage.locator).toBeVisible();
      await expect(popupPage.outlet.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeAttached();
      await expect(popupPage.popup.locator).not.toBeVisible();
      await expect(popupPage.outlet.locator).toBeAttached();
      await expect(popupPage.outlet.locator).not.toBeVisible();
      await expect(popupPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => popupPage.popup.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
      await expect.poll(() => popupPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(popupPage.popup.locator).not.toBeAttached();
        await expect(popupPage.locator).not.toBeAttached();
        await expect(popupPage.outlet.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a popup.
 */
export interface PopupMatcher {
  /**
   * Expects the popup to be visible.
   */
  toBeVisible(): Promise<void>;

  /**
   * Expects the popup to be in the DOM but not visible.
   */
  toBeHidden(): Promise<void>;

  not: {
    /**
     * Expects the popup not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendPopup(popupPage: WorkbenchPopupPagePO | MicrofrontendPopupPagePO): popupPage is MicrofrontendPopupPagePO {
  return !!(popupPage as MicrofrontendPopupPagePO).outlet;
}
