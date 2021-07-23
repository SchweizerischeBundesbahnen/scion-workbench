/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {consumeBrowserLog} from '../helper/testing.util';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {TextNotificationPO} from '../text-notification.po';
import {InspectNotificationPO} from '../inspect-notification.po';
import {expectMap} from '../helper/expect-map-matcher';
import {expectPromise} from '../helper/expect-promise-matcher';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {browser} from 'protractor';

describe('Workbench Notification', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should show a notification with the specified text', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('TEXT');
  });

  it('should support new lines in the notification text', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('LINE 1\nLINE 2');
  });

  it('should close the notification when pressing the ESC key', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await notificationOpenerPagePO.pressEscape();
    await expect(await notificationPO.isDisplayed()).toBe(false);
  });

  it('should close the notification when clicking the close button', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await notificationPO.clickClose();
    await expect(await notificationPO.isDisplayed()).toBe(false);
  });

  it('should stack multiple notifications', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');

    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
  });

  it('should display a notification with the specified title', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('TITLE');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('TITLE');
  });

  it('should support new lines in the notification title', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.notificationPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  it('should, by default, show a notification with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  it('should show a notification with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  it('should show a notification with warn serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('warn');
  });

  it('should show a notification with error serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('error');
  });

  it('should replace notifications of the same group', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    const notification1PO = appPO.findNotification({cssClass: 'testee-1'});
    const notification2PO = appPO.findNotification({cssClass: 'testee-2'});
    const notification3PO = appPO.findNotification({cssClass: 'testee-3'});
    const notification4PO = appPO.findNotification({cssClass: 'testee-4'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification1PO.isDisplayed()).toBe(true);
    await expect(await notification1PO.getSeverity()).toEqual('info');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification1PO.isDisplayed()).toBe(false);
    await expect(await notification2PO.isDisplayed()).toBe(true);
    await expect(await notification2PO.getSeverity()).toEqual('warn');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.enterGroup('GROUP-1');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification2PO.isDisplayed()).toBe(false);
    await expect(await notification3PO.isDisplayed()).toBe(true);
    await expect(await notification3PO.getSeverity()).toEqual('error');
    await expect(await appPO.getNotificationCount()).toEqual(1);

    await notificationOpenerPagePO.enterCssClass('testee-4');
    await notificationOpenerPagePO.enterGroup('GROUP-2');
    await notificationOpenerPagePO.clickShow();

    await expect(await notification3PO.isDisplayed()).toBe(true);
    await expect(await notification4PO.isDisplayed()).toBe(true);
    await expect(await appPO.getNotificationCount()).toEqual(2);
  });

  it('should reject if missing the intention', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await expectPromise(notificationOpenerPagePO.clickShow()).toReject(/NotQualifiedError/);
  });

  it('should close the notification after the auto-close timeout', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register notification intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'notification'});

    // display the notification
    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectDuration(1);
    await notificationOpenerPagePO.enterContent('Notification should close after 1s');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await browser.sleep(2000);
    await expect(await textNotificationPO.isDisplayed()).toBe(false);
  });

  describe('Custom Notification Provider', () => {
    it('should allow opening notifications of other notification providers than the built-in text notification provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
    });

    it('should allow passing a custom input to the notification box', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterContent('CONTENT');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expectMap(await inspectorPO.getInputAsMap()).toContain(new Map()
        .set('component', 'inspector') // qualifier
        .set('$implicit', 'CONTENT') // content
        .set('param1', 'PARAM 1') // params
        .set('param2', 'PARAM 2') // params
        .set('ɵAPP_SYMBOLIC_NAME', 'workbench-client-testing-app1') // headers
        .set('ɵREPLY_TO', jasmine.any(String)),
      );
    });

    it('should allow controlling notification settings', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterTitle('TITLE');
      await notificationOpenerPagePO.enterContent('CONTENT');
      await notificationOpenerPagePO.selectSeverity('warn');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await notificationOpenerPagePO.clickShow();

      const inspectorPO = new InspectNotificationPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
      await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
    });

    it('should open separate notifications if not specifying a group', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the first notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.enterCssClass('testee-1');
      await notificationOpenerPagePO.clickShow();

      // display another notification
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.enterCssClass('testee-2');
      await notificationOpenerPagePO.clickShow();

      await expect(await appPO.getNotificationCount()).toEqual(2);
    });

    it('should throw when not passing params required by the notification provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await expectPromise(notificationOpenerPagePO.clickShow()).toReject(/ParamMismatchError/);
    });

    it('should throw when passing params not specified by the notification provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      // display the notification
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee');
      await notificationOpenerPagePO.enterParams({xyz: 'XYZ'});
      await expectPromise(notificationOpenerPagePO.clickShow()).toReject(/ParamMismatchError/);
    });

    it('should allow reducing params of notifications in the same group', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register notification intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'notification', qualifier: {'component': 'inspector'}});

      const inspectorPage1PO = new InspectNotificationPO('testee-1');
      const inspectorPage2PO = new InspectNotificationPO('testee-2');
      const inspectorPage3PO = new InspectNotificationPO('testee-3');
      const inspectorPage4PO = new InspectNotificationPO('testee-4');
      const inspectorPage5PO = new InspectNotificationPO('testee-5');
      const inspectorPage6PO = new InspectNotificationPO('testee-6');

      // display the notifications of group-1
      const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab('app1');
      await notificationOpenerPagePO.enterQualifier({'component': 'inspector'});
      await notificationOpenerPagePO.enterCssClass('testee-1');
      await notificationOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await notificationOpenerPagePO.enterGroup('group-1');
      await notificationOpenerPagePO.clickShow();

      await expect(await inspectorPage1PO.isDisplayed()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expectMap(await inspectorPage1PO.getInputAsMap()).not.toContain(new Map().set('count', jasmine.any(String)));

      await notificationOpenerPagePO.enterCssClass('testee-2');
      await notificationOpenerPagePO.clickShow();
      await expect(await inspectorPage2PO.isDisplayed()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expectMap(await inspectorPage2PO.getInputAsMap()).toContain(new Map().set('count', 2));

      await notificationOpenerPagePO.enterCssClass('testee-3');
      await notificationOpenerPagePO.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(1);
      await expect(await inspectorPage3PO.isDisplayed()).toBe(true);
      await expectMap(await inspectorPage3PO.getInputAsMap()).toContain(new Map().set('count', 3));

      // display the notifications of group-2
      await notificationOpenerPagePO.enterGroup('group-2');
      await notificationOpenerPagePO.enterCssClass('testee-4');
      await notificationOpenerPagePO.clickShow();

      await expect(await inspectorPage4PO.isDisplayed()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expectMap(await inspectorPage4PO.getInputAsMap()).not.toContain(new Map().set('count', jasmine.any(String)));

      await notificationOpenerPagePO.enterCssClass('testee-5');
      await notificationOpenerPagePO.clickShow();
      await expect(await inspectorPage5PO.isDisplayed()).toBe(true);
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expectMap(await inspectorPage5PO.getInputAsMap()).toContain(new Map().set('count', 2));

      await notificationOpenerPagePO.enterCssClass('testee-6');
      await notificationOpenerPagePO.clickShow();
      await expect(await appPO.getNotificationCount()).toEqual(2);
      await expect(await inspectorPage6PO.isDisplayed()).toBe(true);
      await expectMap(await inspectorPage6PO.getInputAsMap()).toContain(new Map().set('count', 3));
    });
  });
});
