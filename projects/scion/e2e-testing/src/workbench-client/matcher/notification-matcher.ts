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
import {SciRouterOutletPO} from '../page-object/sci-router-outlet.po';
import {NotificationPO} from '../../notification.po';

/**
 * Asserts state and presence of a notification.
 */
export function expectNotification(notification: NotificationPO): NotificationMatcher {
  return {
    toDisplayComponent: async (selector: string): Promise<void> => {
      const notificationId = await notification.getNotificationId();
      const outlet = new SciRouterOutletPO(notification.locator.page(), {name: notificationId});

      await expect(notification.locator).toBeVisible();
      await expect(outlet.locator).toBeVisible();
      await expect(outlet.frameLocator.locator(selector)).toBeVisible();
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(notification.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a notification.
 */
export interface NotificationMatcher {
  /**
   * Expects the notification to display the specified component.
   */
  toDisplayComponent(selector: string): Promise<void>;

  not: {
    /**
     * Expects the notification not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}
