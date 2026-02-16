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
import {NotificationPagePO} from './page-object/notification-page.po';
import {TextNotificationPO} from '../text-notification.po';
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
      const notificationPage = new TextNotificationPO(notification);

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
      const notificationPage = new TextNotificationPO(notification);

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

    test('should reduce the inputs of notifications in the same group', async ({appPO, workbenchNavigator}) => {
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
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
        groupInputReduceFn: 'concat-input-legacy-reducer',
        cssClass: 'testee-6',
        inputLegacy: 'F',
        legacyAPI: true,
      });
      const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
      await expectNotification(notificationPage6).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect(notificationPage6.input).toHaveText('D, E, F');
    });

    test('should close notification via handle', async ({appPO, workbenchNavigator}) => {
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
      const notificationPage = new TextNotificationPO(notification);

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
      await notificationPage.selectDuration(2);

      // Unfocus notification because not closing if focus owner.
      await notificationOpenerPage.view.tab.click();

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
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('Notification');
  });

  test('should support new lines in the notification text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('LINE 1\\nLINE 2', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('LINE 1\nLINE 2');
  });

  test('should show notification with empty text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show(null, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    // Expect text not to be displayed.
    await expect(notificationPage.text).toBeEmpty();

    // Expect the text message box page to display without height.
    await expect.poll(() => notificationPage.getTextBoundingBox()).toMatchObject({
      height: 0,
    });
  });

  test('should close last notification when pressing the ESC key', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-1'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-2'});
    await notificationOpenerPage.show('Notification', {cssClass: 'testee-3'});

    const notificationPage1 = new TextNotificationPO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPO(appPO.notification({cssClass: 'testee-3'}));

    await expect(appPO.notifications).toHaveCount(3);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).toBeVisible();
    await expectNotification(notificationPage3).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(appPO.notifications).toHaveCount(2);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).toBeVisible();
    await expectNotification(notificationPage3).not.toBeAttached();

    await page.keyboard.press('Escape');
    await expect(appPO.notifications).toHaveCount(1);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).not.toBeAttached();

    await page.keyboard.press('Escape');
    await expect(appPO.notifications).toHaveCount(0);
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).not.toBeAttached();
  });

  test('should close focused notification when pressing the ESC key', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification1', {cssClass: 'testee-1'});
    await notificationOpenerPage.show('Notification2', {cssClass: 'testee-2'});
    await notificationOpenerPage.show('Notification3', {cssClass: 'testee-3'});

    const notificationPage1 = new TextNotificationPO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPO(appPO.notification({cssClass: 'testee-3'}));

    await expect(appPO.notifications).toHaveCount(3);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).toBeVisible();
    await expectNotification(notificationPage3).toBeVisible();

    // Focus second notification and close it, by clicking escape
    await notificationPage2.locator.click();
    await page.keyboard.press('Escape');
    await expect(appPO.notifications).toHaveCount(2);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeAttached();

    await page.keyboard.press('Escape');
    await expect(appPO.notifications).toHaveCount(1);
    await expectNotification(notificationPage1).toBeVisible();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).not.toBeAttached();

    await page.keyboard.press('Escape');
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
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('title');
  });

  test('should support new lines in the notification title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {title: 'LINE 1\\nLINE 2', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, show notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'info', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with warn severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'warn', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('warn');
  });

  test('should show notification with error severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {severity: 'error', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationPage1 = new TextNotificationPO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPO(appPO.notification({cssClass: 'testee-3'}));
    const notificationPage4 = new TextNotificationPO(appPO.notification({cssClass: 'testee-4'}));

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
    const notificationPage = new TextNotificationPO(notification);
    await expectNotification(notificationPage).toBeVisible();

    // Hover the notification.
    await notification.hover();

    // Expect notification not to be closed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).toBeVisible();

    // Unhover the notification.
    await appPO.workbenchRoot.hover({position: {x: 0, y: 0}});

    // Hover the notification again.
    await notification.hover();

    // Expect notification not to be closed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).toBeVisible();

    // Unhover the notification.
    await appPO.workbenchRoot.hover({position: {x: 0, y: 0}});

    // Expect notification to be closed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should not close notification on focus', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {duration: 1000, cssClass: 'testee', title: 'test'});

    // Expect the notification to display.
    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);
    await expectNotification(notificationPage).toBeVisible();

    // Focus the notification.
    await notification.locator.focus();

    // Unhover the notification because not closing if hovered.
    await appPO.workbenchRoot.hover({position: {x: 0, y: 0}});

    // Expect notification not to be closed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).toBeVisible();

    // Unfocus notification.
    await notificationOpenerPage.view.tab.click();

    // Expect notification to be closed after 2s.
    await page.waitForTimeout(2000);
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should close notification via handle', async ({appPO, workbenchNavigator}) => {
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

  test('should close notification via auxiliary mouse button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {duration: 'infinite', cssClass: 'testee'});

    // Expect the notification to display.
    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);
    await expectNotification(notificationPage).toBeVisible();

    // Close notification by pressing the middle mouse button.
    await notificationPage.locator.click({button: 'middle'});

    // Expect notification to be closed.
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should not focus notification on open', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});
    const notificationOpenerViewId = await notificationOpenerPage.view.getViewId();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.locator).not.toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual(notificationOpenerViewId);
  });

  test('should adapt notification height to content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    // Capture current size.
    const notificationBounds = await notification.getBoundingBox();
    const notificationPageBounds = await notificationPage.getBoundingBox();
    const padding = notificationBounds.height - notificationPageBounds.height;

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Change the size of the content.
    await notificationPage.enterContentSize({height: '800px'});

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });

    // Shrink the content.
    await notificationPage.enterContentSize({
      height: '400px',
    });

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400 + padding,
      width: 350,
    });

    // Grow the content.
    await notificationPage.enterContentSize({
      height: '800px',
    });

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });
  });

  test('should have fixed notification height', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    // Enter fixed notification height.
    await notificationPage.enterNotificationSize({height: '400px'});

    // Change the size of the content.
    await notificationPage.enterContentSize({height: '800px'});

    // Expect content to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(true);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });

    // Shrink the content.
    await notificationPage.enterContentSize({
      height: '200px',
    });

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });

    // Grow the content.
    await notificationPage.enterContentSize({
      height: '800px',
    });

    // Expect content to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(true);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });
  });

  test('should constrain notification by max-height', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    // Capture current size.
    const notificationBounds = await notification.getBoundingBox();
    const notificationPageBounds = await notificationPage.getBoundingBox();
    const padding = notificationBounds.height - notificationPageBounds.height;

    // Constrain notification height.
    await notificationPage.enterNotificationSize({maxHeight: '400px'});

    // Change the size of the content.
    await notificationPage.enterContentSize({height: '800px'});

    // Expect content to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(true);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });

    // Shrink the content.
    await notificationPage.enterContentSize({
      height: '200px',
    });

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Expect the notification size to be 200px plus padding.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 200 + padding,
      width: 350,
    });

    // Grow the content.
    await notificationPage.enterContentSize({
      height: '800px',
    });

    // Expect content to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(true);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });
  });

  test('should constrain notification by min-height', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('component:notification-page', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    // Capture current size.
    const notificationBounds = await notification.getBoundingBox();
    const notificationPageBounds = await notificationPage.getBoundingBox();
    const padding = notificationBounds.height - notificationPageBounds.height;

    // Constrain notification height.
    await notificationPage.enterNotificationSize({minHeight: '400px'});

    // Change the size of the content.
    await notificationPage.enterContentSize({height: '800px'});

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Expect the notification size to be 800px plus padding.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });

    // Shrink the content.
    await notificationPage.enterContentSize({
      height: '200px',
    });

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Expect the notification size to be 400px.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400,
      width: 350,
    });

    // Grow the content.
    await notificationPage.enterContentSize({
      height: '800px',
    });

    // Expect content not to overflow.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);

    // Expect the notification size to be 800px plus padding.
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });
  });

  test('should wrap text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    // Display notification with a single line.
    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Single Line', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();

    const singleLineBounds = await notification.getBoundingBox();

    // Close the notification.
    await notification.close();

    // Display notification with multiple lines.
    await notificationOpenerPage.show('Multiple Lines '.repeat(100), {cssClass: 'testee'});

    // Expect the notification to break words.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.width)).toEqual(350);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.height)).toBeGreaterThan(singleLineBounds.height);
  });

  test('should wrap "unbreakable" text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    // Display notification with a single line.
    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show('Single Line', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();

    const singleLineBounds = await notification.getBoundingBox();

    // Close the notification.
    await notification.close();

    // Display notification with multiple lines.
    await notificationOpenerPage.show('MultipleLines'.repeat(100), {cssClass: 'testee'});

    // Expect the notification to break words.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.width)).toEqual(350);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.height)).toBeGreaterThan(singleLineBounds.height);
  });

  test('should wrap title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    // Display notification with a single line.
    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show(null, {title: 'Single Line', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeAttached();

    const singleLineBounds = await notification.getBoundingBox();

    // Close the notification.
    await notification.close();

    // Display notification with multiple lines.
    await notificationOpenerPage.show(null, {title: 'Multiple Lines '.repeat(100), cssClass: 'testee'});

    // Expect the notification to break words.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.width)).toEqual(350);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.height)).toBeGreaterThan(singleLineBounds.height);
  });

  test('should wrap "unbreakable" title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, designTokens: {'--sci-workbench-notification-width': '350px'}});

    // Display notification with a single line.
    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.show(null, {title: 'Single Line', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeAttached();

    const singleLineBounds = await notification.getBoundingBox();

    // Close the notification.
    await notification.close();

    // Display notification with multiple lines.
    await notificationOpenerPage.show(null, {title: 'MultipleLines'.repeat(100), cssClass: 'testee'});

    // Expect the notification to break words.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.width)).toEqual(350);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.height)).toBeGreaterThan(singleLineBounds.height);
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

  test('should reduce the inputs of notifications in the same group', async ({appPO, workbenchNavigator}) => {
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
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee-1',
      inputs: {input: 'A'},
    });

    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await expectNotification(notificationPage1).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);
    await expect(notificationPage1.input).toHaveText('A');

    await notificationOpenerPage.show('component:notification-page', {
      group: 'group-1',
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee-2',
      inputs: {input: 'B'},
    });

    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await expectNotification(notificationPage2).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);
    await expect(notificationPage2.input).toHaveText('A, B');

    await notificationOpenerPage.show('component:notification-page', {
      group: 'group-1',
      groupInputReduceFn: 'concat-input-reducer',
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
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee-4',
      inputs: {input: 'D'},
    });

    const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
    await expect(notificationPage4.input).toHaveText('D');

    await notificationOpenerPage.show('component:notification-page', {
      group: 'group-2',
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee-5',
      inputs: {input: 'E'},
    });

    const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
    await expectNotification(notificationPage5).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
    await expect(notificationPage5.input).toHaveText('D, E');

    await notificationOpenerPage.show('component:notification-page', {
      group: 'group-2',
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee-6',
      inputs: {input: 'F'},
    });
    const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));
    await expectNotification(notificationPage6).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
    await expect(notificationPage6.input).toHaveText('D, E, F');
  });

  test('should support asynchronous group input reducer', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right', ratio: .75})
      .addView('view.1', {partId: 'part.right'}),
    );

    // Open notification.
    const routerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await routerPage.show('component:notification-page', {
      inputs: {input: 'value 1'},
      group: 'group',
      cssClass: 'testee-1',
    });

    // Open another notification in same group.
    await routerPage.show('component:notification-page', {
      inputs: {input: 'value 2'},
      group: 'group',
      groupInputReduceFn: 'concat-input-async-reducer',
      cssClass: 'testee-2',
    });

    // Open another notification in same group.
    await routerPage.show('component:notification-page', {
      inputs: {input: 'value 3'},
      group: 'group',
      groupInputReduceFn: 'concat-input-async-reducer',
      cssClass: 'testee-3',
    });

    const notificationPage = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await expectNotification(notificationPage).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);
    await expect(notificationPage.input).toHaveText('value 1, value 2, value 3');
  });

  test('should replace notifications of the same group when opening notifications in quick succession (synchronous reducer function)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open multiple notification of the same group.
    const routerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await routerPage.show('component:notification-page', {
      count: 5,
      inputs: {input: 'value'},
      group: 'group',
      groupInputReduceFn: 'concat-input-reducer',
      cssClass: 'testee',
    });

    const notificationPage = new NotificationPagePO(appPO.notification({cssClass: 'testee'}));
    await expectNotification(notificationPage).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);

    await expect(notificationPage.input).toHaveText('value, value, value, value, value');
  });

  test('should replace notifications of the same group when opening notifications in quick succession (asynchronous reducer function)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open multiple notification of the same group.
    const routerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await routerPage.show('component:notification-page', {
      count: 5,
      inputs: {input: 'value'},
      group: 'group',
      groupInputReduceFn: 'concat-input-async-reducer',
      cssClass: 'testee',
    });

    const notificationPage = new NotificationPagePO(appPO.notification({cssClass: 'testee'}));
    await expectNotification(notificationPage).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);

    await expect(notificationPage.input).toHaveText('value, value, value, value, value');
  });

  test.describe('Notification Component', () => {
    test('should show component', async ({appPO, workbenchNavigator}) => {
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

      await notificationPage.enterTitle('Notification should close after 2s');
      await notificationPage.selectDuration(2000);

      // Unfocus notification because not closing if focus owner.
      await notificationOpenerPage.view.tab.click();

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

      // Unfocus notification because not closing if focus owner.
      await notificationOpenerPage.view.tab.click();

      // Expect the notification to still display after 1.5s.
      await page.waitForTimeout(1500);
      expect(await notification.locator.isVisible()).toBe(true);

      // Expect the notification not to display after 2.5s.
      await page.waitForTimeout(1000);
      expect(await notification.locator.isVisible()).toBe(false);
    });
  });
});
