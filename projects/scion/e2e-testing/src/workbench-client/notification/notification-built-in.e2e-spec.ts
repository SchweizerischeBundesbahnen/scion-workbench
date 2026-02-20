/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../../fixtures';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {expectNotification} from '../../matcher/notification-matcher';
import {MAIN_AREA} from '../../workbench.model';
import {WorkbenchNotificationCapability} from '../page-object/register-workbench-capability-page.po';
import {TextNotificationPO} from '../page-object/text-notification.po';
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {TextMessageBoxPO} from '../page-object/text-message-box.po';

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
      const notificationPage = new TextNotificationPO(notification);

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
      const notificationPage = new TextNotificationPO(notification);

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
      const notificationPage = new TextNotificationPO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.text).toHaveText('Notification');
    });

    test('should throw when not passing required params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        private: false,
        properties: {
          path: '',
        },
        params: [
          {name: 'param', required: true},
        ],
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'testee'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'testee'}, {
        legacyAPI: {enabled: true, textAsConfig: true},
      });
      await expect(notification).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing unspecified params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host notification capability.
      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
        private: false,
      });

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'testee'}});

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      const notification = notificationOpenerPage.show({component: 'testee'}, {
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
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.text).toHaveText('line 1\nline 2');
  });

  test('should show notification with empty text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show(null, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    // Expect text not to be displayed.
    await expect(notificationPage.text).toBeEmpty();

    // Expect the text notification page to display without height.
    await expect.poll(() => notificationPage.getBoundingBox()).toMatchObject({
      height: 0,
    });
  });

  test('should close notification when pressing the ESC key', async ({appPO, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();

    await page.keyboard.press('Escape');
    await expectNotification(notificationPage).not.toBeAttached();
  });

  test('should close notification when clicking the close button', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('title');
  });

  test('should show notification with title only', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('<undefined>', {title: 'title', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(notification.title).toHaveText('title');
  });

  test('should support new lines in the notification title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {title: 'line 1\\nline 2', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('line 1\nline 2');
  });

  test('should wrap text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display notification with a single line.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test('should wrap "unbreakable" text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display notification with a single line.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test('should wrap title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display notification with a single line.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show(null, {title: 'Single Line', cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeAttached();

    const singleLineBounds = await notification.getBoundingBox();

    // Close the notification.
    await notification.close();
    await expectNotification(notificationPage).not.toBeAttached();

    // Display notification with multiple lines.
    await notificationOpenerPage.show(null, {title: 'Multiple Lines '.repeat(100), cssClass: 'testee'});

    // Expect the notification to break words.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.width)).toEqual(350);
    await expect.poll(() => notification.getBoundingBox().then(bounds => bounds.height)).toBeGreaterThan(singleLineBounds.height);
  });

  test('should wrap "unbreakable" title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display notification with a single line.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test('should, by default, show notification with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

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
    const notificationPage = new TextNotificationPO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect.poll(() => notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

    // Display the notifications.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'info', cssClass: 'testee-1'});
    const notificationPage1 = new TextNotificationPO(appPO.notification({cssClass: 'testee-1'}));
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'warn', cssClass: 'testee-2'});
    const notificationPage2 = new TextNotificationPO(appPO.notification({cssClass: 'testee-2'}));
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-1', severity: 'error', cssClass: 'testee-3'});
    const notificationPage3 = new TextNotificationPO(appPO.notification({cssClass: 'testee-3'}));
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show('Notification', {group: 'group-2', cssClass: 'testee-4'});
    const notificationPage4 = new TextNotificationPO(appPO.notification({cssClass: 'testee-4'}));
    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app2');
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

  test('should not close notification after the auto-close, if blocked by dialog', async ({appPO, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'notification'});
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show('Notification', {duration: 2000, cssClass: 'testee'});
    const notification = appPO.notification({cssClass: 'testee'});
    await expectNotification(new TextNotificationPO(notification)).toBeVisible();

    // Display the bound messageBox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageboxOpenerPage.open('Test Message', {
      context: await notification.getNotificationId(),
      cssClass: 'blockedby',
      actions: {
        yes: 'Yes',
      },
    });

    const messageBox = appPO.messagebox({cssClass: 'blockedby'});
    await expectMessageBox(new TextMessageBoxPO(messageBox)).toBeVisible();

    // Expect the notification to still display after 1.5s.
    await page.waitForTimeout(2500);
    expect(await notification.locator.isVisible()).toBe(true);

    // Close messageBox.
    await messageBox.clickActionButton('yes');

    // Expect the notification not to display after 2.5s.
    await page.waitForTimeout(2500);
    expect(await notification.locator.isVisible()).toBe(false);
  });
});
