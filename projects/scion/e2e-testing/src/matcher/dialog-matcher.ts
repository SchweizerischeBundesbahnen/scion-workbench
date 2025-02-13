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
import {MicrofrontendDialogPagePO, WorkbenchDialogPagePO} from '../workbench/page-object/workbench-dialog-page.po';

/**
 * Asserts state and presence of a dialog.
 */
export function expectDialog(dialogPage: WorkbenchDialogPagePO | MicrofrontendDialogPagePO): DialogMatcher {
  if (isMicrofrontendDialog(dialogPage)) {
    return expectMicrofrontendDialog(dialogPage);
  }
  return expectWorkbenchDialog(dialogPage);
}

/**
 * Returns a {@link DialogMatcher} to expect the workbench dialog.
 */
function expectWorkbenchDialog(dialogPage: WorkbenchDialogPagePO): DialogMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(dialogPage.dialog.locator).toBeVisible();
      await expect(dialogPage.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(dialogPage.dialog.locator).toBeAttached();
      await expect(dialogPage.dialog.locator).not.toBeVisible();
      await expect(dialogPage.locator).toBeAttached();
      await expect(dialogPage.locator).not.toBeVisible();
      await expect.poll(() => dialogPage.dialog.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the dialog.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(dialogPage.dialog.locator).not.toBeAttached();
        await expect(dialogPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@link DialogMatcher} to expect the microfrontend dialog.
 */
function expectMicrofrontendDialog(dialogPage: MicrofrontendDialogPagePO): DialogMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(dialogPage.dialog.locator).toBeVisible();
      await expect(dialogPage.locator).toBeVisible();
      await expect(dialogPage.outlet.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(dialogPage.dialog.locator).toBeAttached();
      await expect(dialogPage.dialog.locator).not.toBeVisible();
      await expect(dialogPage.outlet.locator).toBeAttached();
      await expect(dialogPage.outlet.locator).not.toBeVisible();
      await expect(dialogPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => dialogPage.dialog.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the dialog.
      await expect.poll(() => dialogPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the dialog.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(dialogPage.dialog.locator).not.toBeAttached();
        await expect(dialogPage.locator).not.toBeAttached();
        await expect(dialogPage.outlet.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a dialog.
 */
export interface DialogMatcher {
  /**
   * Expects the dialog to be visible.
   */
  toBeVisible(): Promise<void>;

  /**
   * Expects the dialog to be in the DOM but not visible.
   */
  toBeHidden(): Promise<void>;

  not: {
    /**
     * Expects the dialog not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendDialog(dialogPage: WorkbenchDialogPagePO | MicrofrontendDialogPagePO): dialogPage is MicrofrontendDialogPagePO {
  return !!(dialogPage as MicrofrontendDialogPagePO).outlet;
}
