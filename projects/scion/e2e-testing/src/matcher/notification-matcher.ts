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
import {MicrofrontendNotificationPagePO, WorkbenchNotificationPagePO} from '../workbench/page-object/workbench-notification-page.po';

/**
 * Asserts state and presence of a notification.
 */
export function expectNotification(notificationPage: WorkbenchNotificationPagePO): NotificationMatcher {
  if (isMicrofrontendNotification(notificationPage)) {
    return expectMicrofrontendNotification(notificationPage);
  }
  return expectWorkbenchNotification(notificationPage);
}

/**
 * Returns a {@link NotificationMatcher} to expect the workbench notification.
 */
function expectWorkbenchNotification(notificationPage: WorkbenchNotificationPagePO): NotificationMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(notificationPage.notification.locator).toBeVisible();
      await expect(notificationPage.locator).toBeVisible();
    },
    toBeAttached: async (): Promise<void> => {
      await expect(notificationPage.notification.locator).toBeAttached();
      await expect(notificationPage.locator).toBeAttached();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(notificationPage.notification.locator).not.toBeAttached();
        await expect(notificationPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@link NotificationMatcher} to expect the microfrontend notification.
 */
function expectMicrofrontendNotification(notificationPage: MicrofrontendNotificationPagePO): NotificationMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(notificationPage.notification.locator).toBeVisible();
      await expect(notificationPage.locator).toBeVisible();
      await expect(notificationPage.outlet.locator).toBeVisible();
    },
    toBeAttached: async (): Promise<void> => {
      await expect(notificationPage.notification.locator).toBeAttached();
      await expect(notificationPage.locator).toBeAttached();
      await expect(notificationPage.outlet.locator).toBeAttached();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(notificationPage.notification.locator).not.toBeAttached();
        await expect(notificationPage.locator).not.toBeAttached();
        await expect(notificationPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a notification.
 */
export interface NotificationMatcher {
  /**
   * Expects the notification to be visible.
   */
  toBeVisible(): Promise<void>;

  /**
   * Expects the notification to be attached.
   */
  toBeAttached(): Promise<void>;

  not: {
    /**
     * Expects the notification not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendNotification(notificationPage: WorkbenchNotificationPagePO | MicrofrontendNotificationPagePO): notificationPage is MicrofrontendNotificationPagePO {
  return !!(notificationPage as MicrofrontendNotificationPagePO).outlet;
}
