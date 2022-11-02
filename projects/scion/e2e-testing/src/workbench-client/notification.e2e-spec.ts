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
import {InspectNotificationPO} from '../inspect-notification.po';
import {TextNotificationPO} from '../text-notification.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

test.describe('Workbench Notification', () => {

  test('should show a notification with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('TEXT');
  });

  test('should support new lines in the notification text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should close the notification when pressing the ESC key', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await notificationOpenerPagePO.pressEscape();
    await expect(await notificationPO.isVisible()).toBe(false);
  });

  test('should close the notification when clicking the close button', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await notificationPO.clickClose();
    await expect(await notificationPO.isVisible()).toBe(false);
  });

  test('should stack multiple notifications', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');

    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
  });

  test('should display a notification with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('TITLE');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  test('should show a notification with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    const notification1PO = appPO.notification({cssClass: 'testee-1'});
    const notification2PO = appPO.notification({cssClass: 'testee-2'});
    const notification3PO = appPO.notification({cssClass: 'testee-3'});
    const notification4PO = appPO.notification({cssClass: 'testee-4'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification1PO.isVisible()).toBe(true);
    await expect(await notification1PO.getSeverity()).toEqual('info');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification1PO.isVisible()).toBe(false);
    await expect(await notification2PO.isVisible()).toBe(true);
    await expect(await notification2PO.getSeverity()).toEqual('warn');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification2PO.isVisible()).toBe(false);
    await expect(await notification3PO.isVisible()).toBe(true);
    await expect(await notification3PO.getSeverity()).toEqual('error');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-4');
    await notificationOpenerPagePO.enterGroup('GROUP-2');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification3PO.isVisible()).toBe(true);
    await expect(await notification4PO.isVisible()).toBe(true);
    await expect(await appPO.getNotificationCount()).toEqual(2);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await expect(notificationOpenerPagePO.clickShow()).rejects.toThrow(/NotQualifiedError/);
  });

  test('should close the notification after the auto-close timeout', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const notificationDuration = 1; // 1 second

    // register notification intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectDuration(notificationDuration);
    await notificationOpenerPagePO.enterContent('Notification should close after 1s');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await textNotificationPO.waitUntilClosed(notificationDuration * 1000 + 100);
    await expect(await textNotificationPO.isPresent()).toBe(false);
  });

  test.describe('Custom Notification Provider', () => {
    test('should allow opening notifications of other notification providers than the built-in text notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
    });

    test('should allow passing a custom input to the notification box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterContent('CONTENT');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.getInputAsKeyValueObject()).toMatchObject({
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
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterTitle('TITLE');
      await notificationOpenerPagePO.enterContent('CONTENT');
      await notificationOpenerPagePO.selectSeverity('warn');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
      await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
    });

    test('should open separate notifications if not specifying a group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the first notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.enterCssClass('testee-1');
      await notificationOpenerPagePO.clickShow();

      // display another notification
      await notificationOpenerPagePO.enterCssClass('testee-2');
      await notificationOpenerPagePO.clickShow();

      await expect(await appPO.getNotificationCount()).toEqual(2);
    });

    test('should throw when not passing params required by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await expect(notificationOpenerPagePO.clickShow()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing params not specified by the notification provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterParams({xyz: 'XYZ'});
      await expect(notificationOpenerPagePO.clickShow()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should allow reducing params of notifications in the same group', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      const inspectorPage1PO = new InspectNotificationPO(appPO, 'testee-1');
      const inspectorPage2PO = new InspectNotificationPO(appPO, 'testee-2');
      const inspectorPage3PO = new InspectNotificationPO(appPO, 'testee-3');
      const inspectorPage4PO = new InspectNotificationPO(appPO, 'testee-4');
      const inspectorPage5PO = new InspectNotificationPO(appPO, 'testee-5');
      const inspectorPage6PO = new InspectNotificationPO(appPO, 'testee-6');

      // display the notifications of group-1
      const notificationOpenerPagePO = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee-1');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.enterGroup('group-1');
      await notificationOpenerPagePO.clickShow();

      await expect(await inspectorPage1PO.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectorPage1PO.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPagePO.enterCssClass('testee-2');
      await notificationOpenerPagePO.clickShow();
      await expect(await inspectorPage2PO.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectorPage2PO.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPagePO.enterCssClass('testee-3');
      await notificationOpenerPagePO.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectorPage3PO.isVisible()).toBe(true);
      await expect(await inspectorPage3PO.getInputAsKeyValueObject()).toMatchObject({'count': 3});

      // display the notifications of group-2
      await notificationOpenerPagePO.enterGroup('group-2');
      await notificationOpenerPagePO.enterCssClass('testee-4');
      await notificationOpenerPagePO.clickShow();

      await expect(await inspectorPage4PO.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectorPage4PO.getInputAsKeyValueObject()).not.toMatchObject({'count': expect.any(String)});

      await notificationOpenerPagePO.enterCssClass('testee-5');
      await notificationOpenerPagePO.clickShow();
      await expect(await inspectorPage5PO.isVisible()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectorPage5PO.getInputAsKeyValueObject()).toMatchObject({'count': 2});

      await notificationOpenerPagePO.enterCssClass('testee-6');
      await notificationOpenerPagePO.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectorPage6PO.isVisible()).toBe(true);
      await expect(await inspectorPage6PO.getInputAsKeyValueObject()).toMatchObject({'count': 3});
    });
  });
});
