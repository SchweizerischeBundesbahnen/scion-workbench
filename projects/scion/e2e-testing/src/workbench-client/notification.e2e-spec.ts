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

  test('should show a notification with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('Notification');
  });

  test('should support new lines in the notification text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('LINE 1\nLINE 2');
  });

  test('should close the notification when pressing the ESC key', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    await notificationOpenerPage.pressEscape();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should close the notification when clicking the close button', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    await notification.close();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should stack multiple notifications', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');

    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.open();

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.open();

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.open();

    await expect(appPO.notifications).toHaveCount(3);
  });

  test('should display a notification with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('TITLE');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.open();

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    const notificationPage1 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    const notificationPage4 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-4'}));

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await expect(notificationOpenerPage.open()).rejects.toThrow(/NotQualifiedError/);
  });

  test('should close the notification after the auto-close timeout', async ({appPO, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test.describe('Custom Notification Provider', () => {
    test('should allow opening notifications of other notification providers than the built-in text notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.open();

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
    });

    test('should allow passing a custom input to the notification box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterContent('Notification');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPage.open();

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect.poll(() => notificationPage.getInputAsKeyValueObject()).toMatchObject({
        'component': 'notification-page', // qualifier
        '$implicit': 'Notification', // content
        'param1': 'PARAM 1', // params
        'param2': 'PARAM 2', // params
        'ɵAPP_SYMBOLIC_NAME': 'workbench-client-testing-app1', // headers
        'ɵREPLY_TO': expect.any(String),
      });
    });

    test('should allow controlling notification settings', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterTitle('TITLE');
      await notificationOpenerPage.selectSeverity('warn');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPage.open();

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect.poll(() => notification.getSeverity()).toEqual('warn');
      await expect(notification.title).toHaveText('TITLE');
    });

    test('should open separate notifications if not specifying a group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the first notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.enterCssClass('testee-1');
      await notificationOpenerPage.open();

      // display another notification
      await notificationOpenerPage.enterCssClass('testee-2');
      await notificationOpenerPage.open();

      await expect(appPO.notifications).toHaveCount(2);
    });

    test('should throw when not passing params required by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee');
      await expect(notificationOpenerPage.open()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing params not specified by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterParams({xyz: 'XYZ'});
      await expect(notificationOpenerPage.open()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should allow reducing params of notifications in the same group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification-page'}});

      const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
      const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
      const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
      const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
      const notificationPage5 = new NotificationPagePO(appPO.notification({cssClass: 'testee-5'}));
      const notificationPage6 = new NotificationPagePO(appPO.notification({cssClass: 'testee-6'}));

      // display the notifications of group-1
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({component: 'notification-page'});
      await notificationOpenerPage.enterCssClass('testee-1');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.enterGroup('group-1');
      await notificationOpenerPage.open();

      await expectNotification(notificationPage1).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect.poll(() => notificationPage1.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPage.enterCssClass('testee-2');
      await notificationOpenerPage.open();
      await expectNotification(notificationPage2).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect.poll(() => notificationPage2.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPage.enterCssClass('testee-3');
      await notificationOpenerPage.open();
      await expectNotification(notificationPage3).toBeVisible();
      await expect(appPO.notifications).toHaveCount(1);
      await expect.poll(() => notificationPage3.getInputAsKeyValueObject()).toMatchObject({'count': 3});

      // display the notifications of group-2
      await notificationOpenerPage.enterGroup('group-2');
      await notificationOpenerPage.enterCssClass('testee-4');
      await notificationOpenerPage.open();

      await expectNotification(notificationPage4).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect.poll(() => notificationPage4.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPage.enterCssClass('testee-5');
      await notificationOpenerPage.open();
      await expectNotification(notificationPage5).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect.poll(() => notificationPage5.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPage.enterCssClass('testee-6');
      await notificationOpenerPage.open();
      await expectNotification(notificationPage6).toBeVisible();
      await expect(appPO.notifications).toHaveCount(2);
      await expect.poll(() => notificationPage6.getInputAsKeyValueObject()).toMatchObject({'count': 3});
    });
  });
});
