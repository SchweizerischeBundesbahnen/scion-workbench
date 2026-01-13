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
import {TextNotificationPagePO} from '../text-notification-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {expectNotification} from '../matcher/notification-matcher';
import {MAIN_AREA} from '../workbench.model';
import {WorkbenchNotificationCapability} from './page-object/register-workbench-capability-page.po';

test.describe('Workbench Notification', () => {

  test.describe('Legacy Notification API', () => {
    test('should show notification with specified text (text as argument)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show('Notification', {
        legacyAPI: {enabled: true, textAsConfig: false},
      });

      const notification = appPO.notification({cssClass: []}, {nth: 0});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.text).toHaveText('Notification');
    });

    test('should show notification with specified text (text as config) (1/2)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show('Notification', {
        legacyAPI: {enabled: true, textAsConfig: true},
        cssClass: 'testee',
      });

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.text).toHaveText('Notification');
    });

    test('should show notification with specified text (text as config) (2/2)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show('Notification', {
        legacyAPI: {enabled: true, textAsConfig: true},
        cssClass: 'testee',
      });

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new TextNotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.text).toHaveText('Notification');
    });

    test('should show custom host notification', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: true},
        ],
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'notification', app: 'host'}, {
        params: {param1: 'value1', param2: 'value2'},
        title: 'title',
        severity: 'warn',
        duration: 'long',
        group: 'group',
        cssClass: 'class',
        legacyAPI: {enabled: true, textAsConfig: true},
      });

      await expect.poll(() => consoleLogs.get({severity: 'info'})).toContainEqual(
        expect.stringContaining('[HostNotification] command=[title=title, severity=warn, duration=long, group=group, cssClass=class, params=[param1=value1,param2=value2]]'),
      );
    });

    test('should throw when not passing required params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
        params: [
          {name: 'param', required: true},
        ],
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'notification', app: 'host'}, {
        legacyAPI: {enabled: true, textAsConfig: true},
      });
      await expect(notification).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing unspecified params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'notification', app: 'host'}, {
        params: {param: 'value'},
        legacyAPI: {enabled: true, textAsConfig: true},
      });
      await expect(notification).rejects.toThrow(/IntentParamValidationError/);
    });
  });

  test('should show notification with specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('Notification');
  });

  test('should support new lines in the notification text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('line 1\\nline 2', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('line 1\nline 2');
  });

  test('should close notification when pressing the ESC key', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    await notificationOpenerPage.pressEscape();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should close notification when clicking the close button', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    await notification.close();
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should stack multiple notifications', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right', ratio: .75})
      .addView('view.1', {partId: 'part.right'}),
    );

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification 1', {cssClass: 'testee-1'});
    await notificationOpenerPage.show('Notification 2', {cssClass: 'testee-2'});
    await notificationOpenerPage.show('Notification 3', {cssClass: 'testee-3'});

    await expect(appPO.notifications).toHaveCount(3);
  });

  test('should show notification with specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {title: 'title', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('title');
  });

  test('should support new lines in the notification title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {title: 'line 1\\nline 2', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('line 1\nline 2');
  });

  test('should, by default, show notification with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {severity: 'info', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('info');
  });

  test('should show notification with warn severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {severity: 'warn', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('warn');
  });

  test('should show notification with error severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {severity: 'error', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notifications.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'info', cssClass: 'testee-1'});
    const notificationPage1 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'warn', cssClass: 'testee-2'});
    const notificationPage2 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'error', cssClass: 'testee-3'});
    const notificationPage3 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-2', cssClass: 'testee-4'});
    const notificationPage4 = new TextNotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await expect(notificationOpenerPage.show('Notification')).rejects.toThrow(/NotQualifiedError/);
  });

  test('should close notification after the auto-close timeout', async ({appPO, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {duration: 2000, cssClass: 'testee'});

    // Expect the notification to still display after 1.5s.
    const notification = appPO.notification({cssClass: 'testee'});
    await page.waitForTimeout(1500);
    expect(await notification.locator.isVisible()).toBe(true);

    // Expect the notification not to display after 2.5s.
    await page.waitForTimeout(1000);
    expect(await notification.locator.isVisible()).toBe(false);
  });

  test.describe('Custom Notification Provider', () => {

    test('should show custom host notification', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: true},
        ],
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'notification', app: 'host'}, {
        params: {param1: 'value1', param2: 'value2'},
        title: 'title',
        severity: 'warn',
        duration: 'long',
        group: 'group',
        cssClass: 'class',
      });

      await expect.poll(() => consoleLogs.get({severity: 'info'})).toContainEqual(
        expect.stringContaining('[HostNotification] command=[title=title, severity=warn, duration=long, group=group, cssClass=class, params=[param1=value1,param2=value2]]'),
      );
    });

    test('should throw when not passing required params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
        params: [
          {name: 'param', required: true},
        ],
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'notification', app: 'host'});
      await expect(notification).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing unspecified params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'notification', app: 'host'},
        private: false,
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'notification', app: 'host'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'notification', app: 'host'}, {params: {param: 'value'}});
      await expect(notification).rejects.toThrow(/IntentParamValidationError/);
    });
  });
});
