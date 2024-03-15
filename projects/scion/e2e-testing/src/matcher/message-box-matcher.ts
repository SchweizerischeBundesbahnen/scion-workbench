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
import {MicrofrontendMessageBoxPagePO, WorkbenchMessageBoxPagePO} from '../workbench/page-object/workbench-message-box-page.po';

/**
 * Asserts state and presence of a message box.
 */
export function expectMessageBox(messageBoxPage: WorkbenchMessageBoxPagePO): MessageBoxMatcher {
  if (isMicrofrontendMessageBox(messageBoxPage)) {
    return expectMicrofrontendMessageBox(messageBoxPage);
  }
  return expectWorkbenchMessageBox(messageBoxPage);
}

/**
 * Returns a {@link MessageBoxMatcher} to expect the workbench message box.
 */
function expectWorkbenchMessageBox(messageBoxPage: WorkbenchMessageBoxPagePO): MessageBoxMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(messageBoxPage.messageBox.locator).toBeVisible();
      await expect(messageBoxPage.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(messageBoxPage.messageBox.locator).toBeAttached();
      await expect(messageBoxPage.messageBox.locator).not.toBeVisible();
      await expect(messageBoxPage.locator).toBeAttached();
      await expect(messageBoxPage.locator).not.toBeVisible();
      await expect.poll(() => messageBoxPage.messageBox.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the message box.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(messageBoxPage.messageBox.locator).not.toBeAttached();
        await expect(messageBoxPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@link MessageBoxMatcher} to expect the microfrontend message box.
 */
function expectMicrofrontendMessageBox(messageBoxPage: MicrofrontendMessageBoxPagePO): MessageBoxMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(messageBoxPage.messageBox.locator).toBeVisible();
      await expect(messageBoxPage.locator).toBeVisible();
      await expect(messageBoxPage.outlet.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(messageBoxPage.messageBox.locator).toBeAttached();
      await expect(messageBoxPage.messageBox.locator).not.toBeVisible();
      await expect(messageBoxPage.outlet.locator).toBeAttached();
      await expect(messageBoxPage.outlet.locator).not.toBeVisible();
      await expect(messageBoxPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => messageBoxPage.messageBox.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the message box.
      await expect.poll(() => messageBoxPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the message box.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(messageBoxPage.messageBox.locator).not.toBeAttached();
        await expect(messageBoxPage.locator).not.toBeAttached();
        await expect(messageBoxPage.outlet.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a message box.
 */
export interface MessageBoxMatcher {
  /**
   * Expects the message box to be visible.
   */
  toBeVisible(): Promise<void>;

  /**
   * Expects the message box to be in the DOM but not visible.
   */
  toBeHidden(): Promise<void>;

  not: {
    /**
     * Expects the message box not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendMessageBox(messageBoxPage: WorkbenchMessageBoxPagePO | MicrofrontendMessageBoxPagePO): messageBoxPage is MicrofrontendMessageBoxPagePO {
  return !!(messageBoxPage as MicrofrontendMessageBoxPagePO).outlet;
}
