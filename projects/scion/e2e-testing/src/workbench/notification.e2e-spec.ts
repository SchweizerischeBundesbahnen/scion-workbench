/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {consumeBrowserLog} from '../helper/testing.util';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {TextNotificationPO} from '../text-notification.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {browser} from 'protractor';
import {InspectNotificationPO} from '../inspect-notification.po';

describe('Workbench Notification', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should show a notification with the specified text', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('TEXT');
  });

  it('should support new lines in the notification text', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('LINE 1\nLINE 2');
  });

  it('should close the last notification when pressing the ESC key', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1PO = appPO.findNotification({cssClass: 'testee-1'});
    const notification2PO = appPO.findNotification({cssClass: 'testee-2'});
    const notification3PO = appPO.findNotification({cssClass: 'testee-3'});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee-1');

    await notificationOpenerPagePO.clickShow();
    await notificationOpenerPagePO.enterCssClass('testee-2');

    await notificationOpenerPagePO.clickShow();
    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    await expect(await notification1PO.isDisplayed()).toBe(true);
    await expect(await notification2PO.isDisplayed()).toBe(true);
    await expect(await notification3PO.isDisplayed()).toBe(true);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(2);
    await expect(await notification1PO.isDisplayed()).toBe(true);
    await expect(await notification2PO.isDisplayed()).toBe(true);
    await expect(await notification3PO.isPresent()).toBe(false);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(1);
    await expect(await notification1PO.isDisplayed()).toBe(true);
    await expect(await notification2PO.isPresent()).toBe(false);
    await expect(await notification3PO.isPresent()).toBe(false);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(0);
    await expect(await notification1PO.isPresent()).toBe(false);
    await expect(await notification2PO.isPresent()).toBe(false);
    await expect(await notification3PO.isPresent()).toBe(false);
  });

  it('should close the notification when clicking the close button', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await notificationPO.clickClose();
    await expect(await notificationPO.isDisplayed()).toBe(false);
  });

  it('should stack multiple notifications', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();

    const notification1PO = appPO.findNotification({cssClass: 'testee-1'});
    const notification2PO = appPO.findNotification({cssClass: 'testee-2'});
    const notification3PO = appPO.findNotification({cssClass: 'testee-3'});

    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    const clientRect1 = await notification1PO.getClientRect();
    const clientRect2 = await notification2PO.getClientRect();
    const clientRect3 = await notification3PO.getClientRect();

    expect(clientRect1.bottom).toBeLessThan(clientRect2.top);
    expect(clientRect2.bottom).toBeLessThan(clientRect3.top);
    expect(clientRect1.left).toEqual(clientRect2.left);
    expect(clientRect1.left).toEqual(clientRect3.left);
  });

  it('should display a notification with the specified title', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('TITLE');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('TITLE');
  });

  it('should support new lines in the notification title', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO('testee');
    await expect(await textNotificationPO.isDisplayed()).toBe(true);
    await expect(await textNotificationPO.notificationPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  it('should, by default, show a notification with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  it('should show a notification with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  it('should show a notification with warn serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('warn');
  });

  it('should show a notification with error serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.findNotification({cssClass: 'testee'});
    await expect(await notificationPO.isDisplayed()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('error');
  });

  it('should replace notifications of the same group', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1PO = appPO.findNotification({cssClass: 'testee-1'});
    const notification2PO = appPO.findNotification({cssClass: 'testee-2'});
    const notification3PO = appPO.findNotification({cssClass: 'testee-3'});
    const notification4PO = appPO.findNotification({cssClass: 'testee-4'});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
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

  it('should close the notification after the auto-close timeout', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
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

    describe('Custom Message Component', () => {
      it('should allow displaying a custom component', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isPresent()).toBe(true);
        await expect(await inspectorPO.isDisplayed()).toBe(true);
      });

      it('should pass the input', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.enterComponentInput('ABC');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await expect(await inspectorPO.getInput()).toEqual('ABC');
      });

      it('should allow setting the title', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await inspectorPO.enterTitle('TITLE');
        await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
      });

      it('should overwrite the title if also passed by the notification reporter', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.enterTitle('title');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await inspectorPO.enterTitle('TITLE');
        await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
      });

      it('should allow setting the severity', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await inspectorPO.selectSeverity('info');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('info');
        await inspectorPO.selectSeverity('warn');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
        await inspectorPO.selectSeverity('error');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('error');
        await inspectorPO.selectSeverity('');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('info');
      });

      it('should overwrite the severity if also passed by the notification reporter', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectSeverity('warn');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
        await inspectorPO.selectSeverity('error');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('error');
      });

      it('should append CSS class(es)', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass(['testee', 'A', 'B']);
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await expect(await inspectorPO.notificationPO.getCssClasses()).toEqual(jasmine.arrayContaining(['A', 'B']));
        await inspectorPO.enterCssClass('C D');
        await expect(await inspectorPO.notificationPO.getCssClasses()).toEqual(jasmine.arrayContaining(['A', 'B', 'C', 'D']));
      });

      it('should allow setting the auto-close duration', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await inspectorPO.enterTitle('Notification should close after 1s');
        await inspectorPO.selectDuration(1);

        await browser.sleep(2000);
        await expect(await inspectorPO.isDisplayed()).toBe(false);
        await expect(await inspectorPO.isPresent()).toBe(false);
      });

      it('should overwrite the auto-close duration if also passed by the notification reporter', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.enterTitle('Notification should close after the `long` alias expires');
        await notificationOpenerPagePO.selectDuration('long');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO('testee');
        await expect(await inspectorPO.isDisplayed()).toBe(true);
        await inspectorPO.enterTitle('Notification should close after 1s');
        await inspectorPO.selectDuration(1);

        await browser.sleep(2000);
        await expect(await inspectorPO.isDisplayed()).toBe(false);
        await expect(await inspectorPO.isPresent()).toBe(false);
      });

      it('should not reduce the input of notifications in the same group', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectorPage1PO = new InspectNotificationPO('testee-1');
        const inspectorPage2PO = new InspectNotificationPO('testee-2');
        const inspectorPage3PO = new InspectNotificationPO('testee-3');
        const inspectorPage4PO = new InspectNotificationPO('testee-4');
        const inspectorPage5PO = new InspectNotificationPO('testee-5');
        const inspectorPage6PO = new InspectNotificationPO('testee-6');

        // display the notifications of group-1
        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.checkUseGroupInputReduceFn(false); // do not use a reducer (default)
        await notificationOpenerPagePO.enterGroup('group-1');
        await notificationOpenerPagePO.selectComponent('inspect-notification');

        await notificationOpenerPagePO.enterCssClass('testee-1');
        await notificationOpenerPagePO.enterComponentInput('A');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage1PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage1PO.getInput()).toEqual('A');

        await notificationOpenerPagePO.enterCssClass('testee-2');
        await notificationOpenerPagePO.enterComponentInput('B');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage2PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage2PO.getInput()).toEqual('B');

        await notificationOpenerPagePO.enterCssClass('testee-3');
        await notificationOpenerPagePO.enterComponentInput('C');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage3PO.isDisplayed()).toBe(true);
        await expect(await inspectorPage3PO.getInput()).toEqual('C');

        // display the notifications of group-2
        await notificationOpenerPagePO.enterGroup('group-2');
        await notificationOpenerPagePO.enterComponentInput('D');
        await notificationOpenerPagePO.enterCssClass('testee-4');
        await notificationOpenerPagePO.clickShow();

        await expect(await inspectorPage4PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage4PO.getInput()).toEqual('D');

        await notificationOpenerPagePO.enterCssClass('testee-5');
        await notificationOpenerPagePO.enterComponentInput('E');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage5PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage5PO.getInput()).toEqual('E');

        await notificationOpenerPagePO.enterCssClass('testee-6');
        await notificationOpenerPagePO.enterComponentInput('F');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage6PO.isDisplayed()).toBe(true);
        await expect(await inspectorPage6PO.getInput()).toEqual('F');
      });

      it('should reduce the input of notifications in the same group', async () => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectorPage1PO = new InspectNotificationPO('testee-1');
        const inspectorPage2PO = new InspectNotificationPO('testee-2');
        const inspectorPage3PO = new InspectNotificationPO('testee-3');
        const inspectorPage4PO = new InspectNotificationPO('testee-4');
        const inspectorPage5PO = new InspectNotificationPO('testee-5');
        const inspectorPage6PO = new InspectNotificationPO('testee-6');

        // display the notifications of group-1
        const notificationOpenerPagePO = await NotificationOpenerPagePO.openInNewTab();
        await notificationOpenerPagePO.checkUseGroupInputReduceFn(true); // Use test reducer which concatenates notification inputs
        await notificationOpenerPagePO.enterGroup('group-1');
        await notificationOpenerPagePO.selectComponent('inspect-notification');

        await notificationOpenerPagePO.enterCssClass('testee-1');
        await notificationOpenerPagePO.enterComponentInput('A');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage1PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage1PO.getInput()).toEqual('A');

        await notificationOpenerPagePO.enterCssClass('testee-2');
        await notificationOpenerPagePO.enterComponentInput('B');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage2PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage2PO.getInput()).toEqual('A, B');

        await notificationOpenerPagePO.enterCssClass('testee-3');
        await notificationOpenerPagePO.enterComponentInput('C');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage3PO.isDisplayed()).toBe(true);
        await expect(await inspectorPage3PO.getInput()).toEqual('A, B, C');

        // display the notifications of group-2
        await notificationOpenerPagePO.enterGroup('group-2');
        await notificationOpenerPagePO.enterComponentInput('D');
        await notificationOpenerPagePO.enterCssClass('testee-4');
        await notificationOpenerPagePO.clickShow();

        await expect(await inspectorPage4PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage4PO.getInput()).toEqual('D');

        await notificationOpenerPagePO.enterCssClass('testee-5');
        await notificationOpenerPagePO.enterComponentInput('E');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage5PO.isDisplayed()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage5PO.getInput()).toEqual('D, E');

        await notificationOpenerPagePO.enterCssClass('testee-6');
        await notificationOpenerPagePO.enterComponentInput('F');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage6PO.isDisplayed()).toBe(true);
        await expect(await inspectorPage6PO.getInput()).toEqual('D, E, F');
      });
    });
  });
});
