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
import {MicrofrontendDesktopPagePO, WorkbenchDesktopPagePO} from '../workbench/workbench-desktop.po';

/**
 * Asserts state and presence of a desktop.
 */
export function expectDesktop(desktopPage: WorkbenchDesktopPagePO | MicrofrontendDesktopPagePO): DesktopMatcher {
  if (isMicrofrontendDesktop(desktopPage)) {
    return expectMicrofrontendDesktop(desktopPage);
  }
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
    toBeHidden: (): Promise<void> => {
      throw Error('[Unsupported] Use this matcher only to assert microfrontend desktop.');
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
 * Returns a {@link DesktopMatcher} to expect the microfrontend desktop.
 */
function expectMicrofrontendDesktop(desktopPage: MicrofrontendDesktopPagePO): DesktopMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(desktopPage.desktop.locator).toBeVisible();
      await expect(desktopPage.outlet.locator).toBeVisible();
      await expect(desktopPage.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(desktopPage.desktop.locator).not.toBeAttached();
      await expect(desktopPage.outlet.locator).toBeAttached();
      await expect(desktopPage.outlet.locator).not.toBeVisible();
      await expect(desktopPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => desktopPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the desktop.
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(desktopPage.desktop.locator).not.toBeAttached();
        await expect(desktopPage.outlet.locator).not.toBeAttached();
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

  /**
   * Expects the desktop to be in the DOM but not visible.
   */
  toBeHidden(): Promise<void>;

  not: {
    /**
     * Expects the desktop not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendDesktop(desktopPage: WorkbenchDesktopPagePO | MicrofrontendDesktopPagePO): desktopPage is MicrofrontendDesktopPagePO {
  return !!(desktopPage as MicrofrontendDesktopPagePO).outlet;
}
