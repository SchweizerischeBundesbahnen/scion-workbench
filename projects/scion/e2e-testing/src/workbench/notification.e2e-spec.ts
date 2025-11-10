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

test.describe('Workbench Notification', () => {

  test('should show a notification with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('Notification');
  });

  test('should support new lines in the notification text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('LINE 1\nLINE 2');
  });

  test('should close the last notification when pressing the ESC key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationPage1 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-3'}));

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee-1');

    await notificationOpenerPage.open();
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee-2');

    await notificationOpenerPage.open();
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.open();

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

  test('should close the notification when clicking the close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await notification.close();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should stack multiple notifications', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});

    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

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

  test('should display a notification with the specified title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('TITLE');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with info severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error severity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.open();

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
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.open();

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.open();

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.open();

    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.enterCssClass('testee-4');
    await notificationOpenerPage.enterGroup('GROUP-2');
    await notificationOpenerPage.open();

    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should close the notification after the auto-close timeout', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectDuration(2);
    await notificationOpenerPage.enterContent('Notification');

    await notificationOpenerPage.open();

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
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectDuration(1);
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

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
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectDuration('infinite');
    await notificationOpenerPage.selectComponent('notification-page');
    await notificationOpenerPage.open();

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
      test('should allow displaying a custom component', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
      });

      test('should pass the input', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.enterComponentInput('ABC');
        await notificationOpenerPage.open();

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await expect(notificationPage.input).toHaveText('ABC');
      });

      test('should allow setting the title', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await notificationPage.enterTitle('TITLE');
        await expect(notification.title).toHaveText('TITLE');
      });

      test('should overwrite the title if also passed by the notification opener', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.enterTitle('title');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await expectNotification(notificationPage).toBeVisible();
        await notificationPage.enterTitle('TITLE');
        await expect(notification.title).toHaveText('TITLE');
      });

      test('should allow setting the severity', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterContent('Notification');
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

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
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectSeverity('warn');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

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
        await notificationOpenerPage.enterCssClass(['testee', 'A', 'B']);
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

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
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

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

      test('should overwrite the auto-close duration if also passed by the notification opener', async ({appPO, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectDuration('long');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.open();

        const notification = appPO.notification({cssClass: 'testee'});
        const notificationPage = new NotificationPagePO(notification);

        await notificationPage.selectDuration(2);

        // Expect the notification to still display after 1.5s.
        await page.waitForTimeout(1500);
        expect(await notification.locator.isVisible()).toBe(true);

        // Expect the notification not to display after 2.5s.
        await page.waitForTimeout(1000);
        expect(await notification.locator.isVisible()).toBe(false);
      });

      test('should not reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
        const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
        const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
        const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
        const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
        const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));

        // display the notifications of group-1
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.checkUseGroupInputReduceFn(false); // do not use a reducer (default)
        await notificationOpenerPage.enterGroup('group-1');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.enterCssClass('testee-1');
        await notificationOpenerPage.enterComponentInput('A');
        await notificationOpenerPage.open();

        await expectNotification(notificationPage1).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage1.input).toHaveText('A');

        await notificationOpenerPage.enterCssClass('testee-2');
        await notificationOpenerPage.enterComponentInput('B');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage2).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage2.input).toHaveText('B');

        await notificationOpenerPage.enterCssClass('testee-3');
        await notificationOpenerPage.enterComponentInput('C');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage3).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage3.input).toHaveText('C');

        // display the notifications of group-2
        await notificationOpenerPage.enterGroup('group-2');
        await notificationOpenerPage.enterComponentInput('D');
        await notificationOpenerPage.enterCssClass('testee-4');
        await notificationOpenerPage.open();

        await expectNotification(notificationPage4).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage4.input).toHaveText('D');

        await notificationOpenerPage.enterCssClass('testee-5');
        await notificationOpenerPage.enterComponentInput('E');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage5).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage5.input).toHaveText('E');

        await notificationOpenerPage.enterCssClass('testee-6');
        await notificationOpenerPage.enterComponentInput('F');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage6).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage6.input).toHaveText('F');
      });

      test('should reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
        const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
        const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
        const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
        const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
        const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));

        // display the notifications of group-1
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.checkUseGroupInputReduceFn(true); // Use test reducer which concatenates notification inputs
        await notificationOpenerPage.enterGroup('group-1');
        await notificationOpenerPage.selectComponent('notification-page');
        await notificationOpenerPage.enterCssClass('testee-1');
        await notificationOpenerPage.enterComponentInput('A');
        await notificationOpenerPage.open();

        await expectNotification(notificationPage1).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage1.input).toHaveText('A');

        await notificationOpenerPage.enterCssClass('testee-2');
        await notificationOpenerPage.enterComponentInput('B');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage2).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage2.input).toHaveText('A, B');

        await notificationOpenerPage.enterCssClass('testee-3');
        await notificationOpenerPage.enterComponentInput('C');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage3).toBeVisible();
        await expect(appPO.notifications).toHaveCount(1);
        await expect(notificationPage3.input).toHaveText('A, B, C');

        // display the notifications of group-2
        await notificationOpenerPage.enterGroup('group-2');
        await notificationOpenerPage.enterComponentInput('D');
        await notificationOpenerPage.enterCssClass('testee-4');
        await notificationOpenerPage.open();

        await expectNotification(notificationPage4).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage4.input).toHaveText('D');

        await notificationOpenerPage.enterCssClass('testee-5');
        await notificationOpenerPage.enterComponentInput('E');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage5).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage5.input).toHaveText('D, E');

        await notificationOpenerPage.enterCssClass('testee-6');
        await notificationOpenerPage.enterComponentInput('F');
        await notificationOpenerPage.open();
        await expectNotification(notificationPage6).toBeVisible();
        await expect(appPO.notifications).toHaveCount(2);
        await expect(notificationPage6.input).toHaveText('D, E, F');
      });
    });
  });
});
