/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {NotificationPagePO} from '../notification-page.po';
import {TextNotificationPagePO} from '../text-notification-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {expectNotification} from '../matcher/notification-matcher';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench Notification', () => {

  test.describe('Legacy Notification API', () => {

    test('should show notification with the specified text', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('Notification', {legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.text).toHaveText('Notification');
    });

    test('should show notification with the specified component', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
    });

    test('should show notification with title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('Notification', {legacyAPI: true, title: 'title', cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notification.title).toHaveText('title');
    });

    test('should show notification with inputs', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {inputLegacy: 'ABC', legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.input).toHaveText('ABC');
    });

    test('should close notification after the auto-close timeout', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('Notification', {legacyAPI: true, duration: 2, cssClass: 'testee'});

      // Expect the notification to still display after 1.5s.
      const notification = appPO.notification({cssClass: 'testee'});
      await page.waitForTimeout(1500);
      expect(await notification.locator.isVisible()).toBe(true);

      // Expect the notification not to display after 2.5s.
      await page.waitForTimeout(1000);
      expect(await notification.locator.isVisible()).toBe(false);
    });

    test('should not reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Add part to the right for notifications to not cover the notification opener page.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {align: 'right', ratio: .75})
        .addView('view.1', {partId: 'part.right'}),
      );

      // Display notifications of group-1.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        cssClass: 'testee-1',
        inputLegacy: 'A',
        legacyAPI: true,
      });

      const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
      await expectNotification(notificationPage1).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage1.input).toHaveText('A');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        cssClass: 'testee-2',
        inputLegacy: 'B',
        legacyAPI: true,
      });

      const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
      await expectNotification(notificationPage2).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage2.input).toHaveText('B');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        cssClass: 'testee-3',
        inputLegacy: 'C',
        legacyAPI: true,
      });

      const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
      await expectNotification(notificationPage3).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage3.input).toHaveText('C');

      // Display notifications of group-2.
      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        cssClass: 'testee-4',
        inputLegacy: 'D',
        legacyAPI: true,
      });

      const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
      await expectNotification(notificationPage4).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage4.input).toHaveText('D');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        cssClass: 'testee-5',
        inputLegacy: 'E',
        legacyAPI: true,
      });

      const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
      await expectNotification(notificationPage5).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage5.input).toHaveText('E');

      const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        cssClass: 'testee-6',
        inputLegacy: 'F',
        legacyAPI: true,
      });

      await expectNotification(notificationPage6).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage6.input).toHaveText('F');
    });

    test('should reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Add part to the right for notifications to not cover the notification opener page.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {align: 'right', ratio: .75})
        .addView('view.1', {partId: 'part.right'}),
      );

      // Display notifications of group-1.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        useGroupInputReducer: true,
        cssClass: 'testee-1',
        inputLegacy: 'A',
        legacyAPI: true,
      });

      const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
      await expectNotification(notificationPage1).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage1.input).toHaveText('A');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        useGroupInputReducer: true,
        cssClass: 'testee-2',
        inputLegacy: 'B',
        legacyAPI: true,
      });

      const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
      await expectNotification(notificationPage2).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage2.input).toHaveText('A, B');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-1',
        useGroupInputReducer: true,
        cssClass: 'testee-3',
        inputLegacy: 'C',
        legacyAPI: true,
      });

      const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
      await expectNotification(notificationPage3).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect(notificationPage3.input).toHaveText('A, B, C');

      // Display notifications of group-2.
      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        useGroupInputReducer: true,
        cssClass: 'testee-4',
        inputLegacy: 'D',
        legacyAPI: true,
      });

      const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
      await expectNotification(notificationPage4).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage4.input).toHaveText('D');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        useGroupInputReducer: true,
        cssClass: 'testee-5',
        inputLegacy: 'E',
        legacyAPI: true,
      });

      const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
      await expectNotification(notificationPage5).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage5.input).toHaveText('D, E');

      await notificationOpenerPage.show('component:legacy-notification-page', {
        group: 'group-2',
        useGroupInputReducer: true,
        cssClass: 'testee-6',
        inputLegacy: 'F',
        legacyAPI: true,
      });
      const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
      await expectNotification(notificationPage6).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage6.input).toHaveText('D, E, F');
    });

    test('should close notification via handle', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {duration: 'infinite', cssClass: 'testee', legacyAPI: true});

      // Expect the notification to display.
      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);
      await expectNotification(notificationPage).toBeVisible();

      // Close notification.
      await notificationPage.close();

      // Expect notification to be closed.
      await expectNotification(notificationPage).not.toBeAttached();
    });

    test('should show notification with warn severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('Notification', {legacyAPI: true, severity: 'warn', cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect.poll(() => notification.getSeverity()).toEqual('warn');
    });

    test('should allow setting severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();

      await notificationPage.selectSeverity('info');
      await expect.poll(() => notification.getSeverity()).toEqual('info');

      await notificationPage.selectSeverity('warn');
      await expect.poll(() => notification.getSeverity()).toEqual('warn');

      await notificationPage.selectSeverity('error');
      await expect.poll(() => notification.getSeverity()).toEqual('error');
    });

    test('should allow setting title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await notificationPage.enterTitle('TITLE');
      await expect(notification.title).toHaveText('TITLE');
    });

    test('should allow setting the auto-close duration', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:legacy-notification-page', {legacyAPI: true, cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await notificationPage.enterTitle('Notification should close after 1s');
      await notificationPage.selectDuration(2);

      // Expect the notification to still display after 1.5s.
      await page.waitForTimeout(1500);
      expect(await notification.locator.isVisible()).toBe(true);

      // Expect the notification not to display after 2.5s.
      await page.waitForTimeout(1000);
      expect(await notification.locator.isVisible()).toBe(false);
    });
  });

  test('should show notification with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('Notification');
  });

  test('should support new lines in the notification text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('LINE 1\\nLINE 2', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('LINE 1\nLINE 2');
  });

  test('should close the last notification when pressing the ESC key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-1'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-2'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-3'});

    const notificationPage1 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-3'}));

    await expect(appPO.notifications).toHaveCount(3);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).toBeVisible();
    await expectNotification(notificationPage3).toBeVisible();

    await notificationOpenerPage.pressEscape();
    await expect(appPO.notifications).toHaveCount(2);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).toBeVisible();
    await expectNotification(notificationPage3).not.toBeAttached();

    await notificationOpenerPage.pressEscape();
    await expect(appPO.notifications).toHaveCount(1);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).not.toBeAttached();

    await notificationOpenerPage.pressEscape();
    await expect(appPO.notifications).toHaveCount(0);
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).not.toBeAttached();
  });

  test('should close notification when clicking the close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await notification.close();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should stack multiple notifications', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-1'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-2'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-3'});

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});

    await expect(appPO.notifications).toHaveCount(3);
    await expect(async () => {
      const clientRect1 = await notification1.getBoundingBox();
      const clientRect2 = await notification2.getBoundingBox();
      const clientRect3 = await notification3.getBoundingBox();

      expect(clientRect1.bottom).toBeLessThan(clientRect2.top);
      expect(clientRect2.bottom).toBeLessThan(clientRect3.top);
      expect(clientRect1.left).toEqual(clientRect2.left);
      expect(clientRect1.left).toEqual(clientRect3.left);
    }).toPass();
  });

  test('should show notification with title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {title: 'title', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('title');
  });

  test('should support new lines in the notification title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {title: 'LINE 1\\nLINE 2', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, show notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'info', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with warn severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'warn', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('warn');
  });

  test('should show notification with error severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'error', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationPage1 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    const notificationPage4 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-4'}));

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {
      severity: 'info',
      group: 'GROUP-1',
      cssClass: 'testee-1',
    });

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {
      severity: 'warn',
      group: 'GROUP-1',
      cssClass: 'testee-2',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {
      severity: 'error',
      group: 'GROUP-1',
      cssClass: 'testee-3',
    });

    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {
      group: 'GROUP-2',
      cssClass: 'testee-4',
    });

    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should close notification after the auto-close timeout', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {duration: 2000, cssClass: 'testee'});

    // Expect the notification to still display after 1.5s.
    const notification = appPO.notification({cssClass: 'testee'});
    await page.waitForTimeout(1500);
    expect(await notification.locator.isVisible()).toBe(true);

    // Expect the notification not to display after 2.5s.
    await page.waitForTimeout(1000);
    expect(await notification.locator.isVisible()).toBe(false);
  });

  test('should not close notification on hover', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {duration: 1000, cssClass: 'testee'});

    // Expect the notification to display.
    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);
    await expectNotification(notificationPage).toBeVisible();

    // Hover the notification.
    await notification.hover();

    // Expect notification not to be disposed after 3s.
    await page.waitForTimeout(3000);
    await expectNotification(notificationPage).toBeVisible();

    // Do not hover notification.
    await appPO.workbenchRoot.hover({position: {x: 0, y: 0}});

    // Hover the notification.
    await notification.hover();

    // Expect notification not to be disposed after 3s.
    await page.waitForTimeout(3000);
    await expectNotification(notificationPage).toBeVisible();

    // Do not hover notification.
    await appPO.workbenchRoot.hover({position: {x: 0, y: 0}});

    // Expect notification to be disposed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should close notification via handle', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {duration: 'infinite', cssClass: 'testee'});

    // Expect the notification to display.
    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);
    await expectNotification(notificationPage).toBeVisible();

    // Close notification.
    await notificationPage.close();

    // Expect notification to be closed.
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test.describe('Custom Notification Provider', () => {

    test.describe('Custom Message Component', () => {
      test('should show custom component', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
      });

      test('should show notification with inputs', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {inputs: {input: 'ABC'}, cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await expect(notificationPage.input).toHaveText('ABC');
      });

      test('should allow setting title', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await notificationPage.enterTitle('TITLE');
        await expect(notification.title).toHaveText('TITLE');
      });

      test('should overwrite the title if also passed by the notification opener', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {title: 'title', cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await notificationPage.enterTitle('TITLE');
        await expect(notification.title).toHaveText('TITLE');
      });

      test('should allow setting severity', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();

        await notificationPage.selectSeverity('info');
        await expect.poll(() => notification.getSeverity()).toEqual('info');

        await notificationPage.selectSeverity('warn');
        await expect.poll(() => notification.getSeverity()).toEqual('warn');

        await notificationPage.selectSeverity('error');
        await expect.poll(() => notification.getSeverity()).toEqual('error');
      });

      test('should overwrite the severity if also passed by the notification opener', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {severity: 'warn', cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();

        await expect.poll(() => notification.getSeverity()).toEqual('warn');

        await notificationPage.selectSeverity('error');
        await expect.poll(() => notification.getSeverity()).toEqual('error');
      });

      test('should append CSS class(es)', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {cssClass: ['testee', 'A', 'B']});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await expect.poll(() => notification.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B']));

        await notificationPage.enterCssClass('C D');
        await expect.poll(() => notification.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
      });

      test('should allow setting the auto-close duration', async ({appPO, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await notificationPage.enterTitle('Notification should close after 1s');
        await notificationPage.selectDuration(2000);

        // Expect the notification to still display after 1.5s.
        await page.waitForTimeout(1500);
        expect(await notification.locator.isVisible()).toBe(true);

        // Expect the notification not to display after 2.5s.
        await page.waitForTimeout(1000);
        expect(await notification.locator.isVisible()).toBe(false);
      });

      test('should overwrite the auto-close duration if also passed by the notification opener', async ({appPO, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {duration: 'long', cssClass: 'testee'});

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await notificationPage.selectDuration(2000);

        // Expect the notification to still display after 1.5s.
        await page.waitForTimeout(1500);
        expect(await notification.locator.isVisible()).toBe(true);

        // Expect the notification not to display after 2.5s.
        await page.waitForTimeout(1000);
        expect(await notification.locator.isVisible()).toBe(false);
      });

      test('should not reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Add part to the right for notifications to not cover the notification opener page.
        await workbenchNavigator.createPerspective(factory => factory
          .addPart(MAIN_AREA)
          .addPart('part.right', {align: 'right', ratio: .75})
          .addView('view.1', {partId: 'part.right'}),
        );

        // Display notifications of group-1.
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          cssClass: 'testee-1',
          inputs: {input: 'A'},
        });

        const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
        await expectNotification(notificationPage1).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage1.input).toHaveText('A');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          cssClass: 'testee-2',
          inputs: {input: 'B'},
        });

        const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
        await expectNotification(notificationPage2).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage2.input).toHaveText('B');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          cssClass: 'testee-3',
          inputs: {input: 'C'},
        });

        const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
        await expectNotification(notificationPage3).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage3.input).toHaveText('C');

        // Display notifications of group-2.
        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          cssClass: 'testee-4',
          inputs: {input: 'D'},
        });

        const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
        await expectNotification(notificationPage4).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage4.input).toHaveText('D');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          cssClass: 'testee-5',
          inputs: {input: 'E'},
        });

        const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
        await expectNotification(notificationPage5).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage5.input).toHaveText('E');

        const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          cssClass: 'testee-6',
          inputs: {input: 'F'},
        });

        await expectNotification(notificationPage6).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage6.input).toHaveText('F');
      });

      test('should reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Add part to the right for notifications to not cover the notification opener page.
        await workbenchNavigator.createPerspective(factory => factory
          .addPart(MAIN_AREA)
          .addPart('part.right', {align: 'right', ratio: .75})
          .addView('view.1', {partId: 'part.right'}),
        );

        // Display notifications of group-1.
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          useGroupInputReducer: true,
          cssClass: 'testee-1',
          inputs: {input: 'A'},
        });

        const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
        await expectNotification(notificationPage1).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage1.input).toHaveText('A');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          useGroupInputReducer: true,
          cssClass: 'testee-2',
          inputs: {input: 'B'},
        });

        const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
        await expectNotification(notificationPage2).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage2.input).toHaveText('A, B');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-1',
          useGroupInputReducer: true,
          cssClass: 'testee-3',
          inputs: {input: 'C'},
        });

        const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
        await expectNotification(notificationPage3).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage3.input).toHaveText('A, B, C');

        // Display notifications of group-2.
        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          useGroupInputReducer: true,
          cssClass: 'testee-4',
          inputs: {input: 'D'},
        });

        const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
        await expectNotification(notificationPage4).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage4.input).toHaveText('D');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          useGroupInputReducer: true,
          cssClass: 'testee-5',
          inputs: {input: 'E'},
        });

        const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
        await expectNotification(notificationPage5).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage5.input).toHaveText('D, E');

        await notificationOpenerPage.show('component:notification-page', {
          group: 'group-2',
          useGroupInputReducer: true,
          cssClass: 'testee-6',
          inputs: {input: 'F'},
        });
        const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
        await expectNotification(notificationPage6).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage6.input).toHaveText('D, E, F');
      });
    });
  });
});
