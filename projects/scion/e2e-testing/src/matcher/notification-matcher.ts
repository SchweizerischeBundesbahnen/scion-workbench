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
import {WorkbenchNotificationPagePO} from '../workbench/page-object/workbench-notification-page.po';

/**
 * Asserts state and presence of a notification.
 */
export function expectNotification(notificationPage: WorkbenchNotificationPagePO): NotificationMatcher {
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
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(notificationPage.notification.locator).not.toBeAttached();
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

  not: {
    /**
     * Expects the notification not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
