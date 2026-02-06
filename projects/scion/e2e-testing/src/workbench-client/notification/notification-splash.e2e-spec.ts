/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {MessagingPagePO} from '../page-object/messaging-page.po';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {NotificationPagePO} from '../page-object/notification-page.po';
import {WorkbenchNotificationCapability} from '../page-object/register-workbench-capability-page.po';

test.describe('Workbench Notification Splash', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register notification capability that shows splash.
    const notificationCapability = await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        size: {
          height: '500px',
        },
        showSplash: true,
      },
    });

    // Show notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect splash to display.
    await expect(notificationPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage(`signal-ready/${notificationCapability.metadata!.id}`);
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(notificationPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        size: {
          height: '500px',
        },
        showSplash: false,
      },
    });

    // Show notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect splash not to display.
    await expect(notificationPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        size: {
          height: '500px',
        },
      },
    });

    // Show notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect splash not to display.
    await expect(notificationPage.outlet.splash).not.toBeVisible();
  });
});
