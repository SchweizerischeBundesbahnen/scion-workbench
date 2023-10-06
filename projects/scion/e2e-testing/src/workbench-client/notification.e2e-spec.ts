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
import {InspectNotificationComponentPO} from '../inspect-notification-component.po';
import {TextNotificationComponentPO} from '../text-notification-component.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

test.describe('Workbench Notification', () => {

  test('should show a notification with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('TEXT');
    await notificationOpenerPage.clickShow();

    const textNotificationComponent = new TextNotificationComponentPO(appPO, 'testee');
    await expect(await textNotificationComponent.isVisible()).toBe(true);
    await expect(await textNotificationComponent.getText()).toEqual('TEXT');
  });

  test('should support new lines in the notification text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPage.clickShow();

    const textNotificationComponent = new TextNotificationComponentPO(appPO, 'testee');
    await expect(await textNotificationComponent.isVisible()).toBe(true);
    await expect(await textNotificationComponent.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should close the notification when pressing the ESC key', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await notificationOpenerPage.pressEscape();
    await expect(await notification.isVisible()).toBe(false);
  });

  test('should close the notification when clicking the close button', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('TEXT');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await notification.clickClose();
    await expect(await notification.isVisible()).toBe(false);
  });

  test('should stack multiple notifications', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');

    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.clickShow();

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.clickShow();

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
  });

  test('should display a notification with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('TITLE');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});
    const notification4 = appPO.notification({cssClass: 'testee-4'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.clickShow();

    await expect(await notification1.isVisible()).toBe(true);
    await expect(await notification1.getSeverity()).toEqual('info');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.clickShow();

    await expect(await notification1.isVisible()).toBe(false);
    await expect(await notification2.isVisible()).toBe(true);
    await expect(await notification2.getSeverity()).toEqual('warn');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.enterGroup('GROUP-1');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.clickShow();

    await expect(await notification2.isVisible()).toBe(false);
    await expect(await notification3.isVisible()).toBe(true);
    await expect(await notification3.getSeverity()).toEqual('error');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPage.enterCssClass('testee-4');
    await notificationOpenerPage.enterGroup('GROUP-2');
    await notificationOpenerPage.clickShow();

    await expect(await notification3.isVisible()).toBe(true);
    await expect(await notification4.isVisible()).toBe(true);
    await expect(await appPO.getNotificationCount()).toEqual(2);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await expect(notificationOpenerPage.clickShow()).rejects.toThrow(/NotQualifiedError/);
  });

  test('should close the notification after the auto-close timeout', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const notificationDuration = 1; // 1 second

    // register notification intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectDuration(notificationDuration);
    await notificationOpenerPage.enterContent('Notification should close after 1s');
    await notificationOpenerPage.clickShow();

    const textNotificationComponent = new TextNotificationComponentPO(appPO, 'testee');
    await expect(await textNotificationComponent.isVisible()).toBe(true);
    await textNotificationComponent.waitUntilClosed(notificationDuration * 1000 + 500);
    await expect(await textNotificationComponent.isPresent()).toBe(false);
  });

  test.describe('Custom Notification Provider', () => {
    test('should allow opening notifications of other notification providers than the built-in text notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.clickShow();

      const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
      await expect(await inspectNotificationComponent.isVisible()).toBe(true);
    });

    test('should allow passing a custom input to the notification box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterContent('CONTENT');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPage.clickShow();

      const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
      await expect(await inspectNotificationComponent.isVisible()).toBe(true);
      await expect(await inspectNotificationComponent.getInputAsKeyValueObject()).toMatchObject({
          'component': 'inspector', // qualifier
          '$implicit': 'CONTENT', // content
          'param1': 'PARAM 1', // params
          'param2': 'PARAM 2', // params
          'ɵAPP_SYMBOLIC_NAME': 'workbench-client-testing-app1', // headers
          'ɵREPLY_TO': expect.any(String),
        },
      );
    });

    test('should allow controlling notification settings', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterTitle('TITLE');
      await notificationOpenerPage.enterContent('CONTENT');
      await notificationOpenerPage.selectSeverity('warn');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPage.clickShow();

      const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
      await expect(await inspectNotificationComponent.isVisible()).toBe(true);
      await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('warn');
      await expect(await inspectNotificationComponent.notification.getTitle()).toEqual('TITLE');
    });

    test('should open separate notifications if not specifying a group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the first notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.enterCssClass('testee-1');
      await notificationOpenerPage.clickShow();

      // display another notification
      await notificationOpenerPage.enterCssClass('testee-2');
      await notificationOpenerPage.clickShow();

      await expect(await appPO.getNotificationCount()).toEqual(2);
    });

    test('should throw when not passing params required by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee');
      await expect(notificationOpenerPage.clickShow()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing params not specified by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee');
      await notificationOpenerPage.enterParams({xyz: 'XYZ'});
      await expect(notificationOpenerPage.clickShow()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should allow reducing params of notifications in the same group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      const inspectNotificationComponent1 = new InspectNotificationComponentPO(appPO, 'testee-1');
      const inspectNotificationComponent2 = new InspectNotificationComponentPO(appPO, 'testee-2');
      const inspectNotificationComponent3 = new InspectNotificationComponentPO(appPO, 'testee-3');
      const inspectNotificationComponent4 = new InspectNotificationComponentPO(appPO, 'testee-4');
      const inspectNotificationComponent5 = new InspectNotificationComponentPO(appPO, 'testee-5');
      const inspectNotificationComponent6 = new InspectNotificationComponentPO(appPO, 'testee-6');

      // display the notifications of group-1
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.enterQualifier({'component': 'inspector'});
      await notificationOpenerPage.enterCssClass('testee-1');
      await notificationOpenerPage.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPage.enterGroup('group-1');
      await notificationOpenerPage.clickShow();

      await expect(await inspectNotificationComponent1.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectNotificationComponent1.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPage.enterCssClass('testee-2');
      await notificationOpenerPage.clickShow();
      await expect(await inspectNotificationComponent2.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectNotificationComponent2.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPage.enterCssClass('testee-3');
      await notificationOpenerPage.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectNotificationComponent3.isVisible()).toBe(true);
      await expect(await inspectNotificationComponent3.getInputAsKeyValueObject()).toMatchObject({'count': 3});

      // display the notifications of group-2
      await notificationOpenerPage.enterGroup('group-2');
      await notificationOpenerPage.enterCssClass('testee-4');
      await notificationOpenerPage.clickShow();

      await expect(await inspectNotificationComponent4.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectNotificationComponent4.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPage.enterCssClass('testee-5');
      await notificationOpenerPage.clickShow();
      await expect(await inspectNotificationComponent5.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectNotificationComponent5.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPage.enterCssClass('testee-6');
      await notificationOpenerPage.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectNotificationComponent6.isVisible()).toBe(true);
      await expect(await inspectNotificationComponent6.getInputAsKeyValueObject()).toMatchObject({'count': 3});
    });
  });
});
