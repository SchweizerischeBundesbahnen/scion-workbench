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
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

test.describe('Workbench Notification', () => {

  test('should show a notification with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('TEXT');
  });

  test('should support new lines in the notification text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await expect(await textNotificationPO.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should close the last notification when pressing the ESC key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1PO = appPO.notification({cssClass: 'testee-1'});
    const notification2PO = appPO.notification({cssClass: 'testee-2'});
    const notification3PO = appPO.notification({cssClass: 'testee-3'});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee-1');

    await notificationOpenerPagePO.clickShow();
    await notificationOpenerPagePO.enterCssClass('testee-2');

    await notificationOpenerPagePO.clickShow();
    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    await expect(await notification1PO.isVisible()).toBe(true);
    await expect(await notification2PO.isVisible()).toBe(true);
    await expect(await notification3PO.isVisible()).toBe(true);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(2);
    await expect(await notification1PO.isVisible()).toBe(true);
    await expect(await notification2PO.isVisible()).toBe(true);
    await expect(await notification3PO.isPresent()).toBe(false);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(1);
    await expect(await notification1PO.isVisible()).toBe(true);
    await expect(await notification2PO.isPresent()).toBe(false);
    await expect(await notification3PO.isPresent()).toBe(false);

    await notificationOpenerPagePO.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(0);
    await expect(await notification1PO.isPresent()).toBe(false);
    await expect(await notification2PO.isPresent()).toBe(false);
    await expect(await notification3PO.isPresent()).toBe(false);
  });

  test('should close the notification when clicking the close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterContent('TEXT');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await notificationPO.clickClose();
    await expect(await notificationPO.isVisible()).toBe(false);
  });

  test('should stack multiple notifications', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);

    const notification1PO = appPO.notification({cssClass: 'testee-1'});
    const notification2PO = appPO.notification({cssClass: 'testee-2'});
    const notification3PO = appPO.notification({cssClass: 'testee-3'});

    await notificationOpenerPagePO.enterCssClass('testee-1');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-2');
    await notificationOpenerPagePO.clickShow();

    await notificationOpenerPagePO.enterCssClass('testee-3');
    await notificationOpenerPagePO.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    const clientRect1 = await notification1PO.getBoundingBox();
    const clientRect2 = await notification2PO.getBoundingBox();
    const clientRect3 = await notification3PO.getBoundingBox();

    expect(clientRect1.bottom).toBeLessThan(clientRect2.top);
    expect(clientRect2.bottom).toBeLessThan(clientRect3.top);
    expect(clientRect1.left).toEqual(clientRect2.left);
    expect(clientRect1.left).toEqual(clientRect3.left);
  });

  test('should display a notification with the specified title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('TITLE');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  test('should show a notification with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('info');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('warn');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectSeverity('error');
    await notificationOpenerPagePO.clickShow();

    const notificationPO = appPO.notification({cssClass: 'testee'});
    await expect(await notificationPO.isVisible()).toBe(true);
    await expect(await notificationPO.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1PO = appPO.notification({cssClass: 'testee-1'});
    const notification2PO = appPO.notification({cssClass: 'testee-2'});
    const notification3PO = appPO.notification({cssClass: 'testee-3'});
    const notification4PO = appPO.notification({cssClass: 'testee-4'});

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
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

  test('should close the notification after the auto-close timeout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const notificationDuration = 1; // 1 second

    const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPagePO.enterCssClass('testee');
    await notificationOpenerPagePO.selectDuration(notificationDuration);
    await notificationOpenerPagePO.enterContent('Notification should close after 1s');
    await notificationOpenerPagePO.clickShow();

    const textNotificationPO = new TextNotificationPO(appPO, 'testee');
    await expect(await textNotificationPO.isVisible()).toBe(true);
    await textNotificationPO.waitUntilClosed(notificationDuration * 1000 + 500);
    await expect(await textNotificationPO.isPresent()).toBe(false);
  });

  test.describe('Custom Notification Provider', () => {

    test.describe('Custom Message Component', () => {
      test('should allow displaying a custom component', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isPresent()).toBe(true);
        await expect(await inspectorPO.isVisible()).toBe(true);
      });

      test('should pass the input', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.enterComponentInput('ABC');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await expect(await inspectorPO.getInput()).toEqual('ABC');
      });

      test('should allow setting the title', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await inspectorPO.enterTitle('TITLE');
        await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
      });

      test('should overwrite the title if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.enterTitle('title');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await inspectorPO.enterTitle('TITLE');
        await expect(await inspectorPO.notificationPO.getTitle()).toEqual('TITLE');
      });

      test('should allow setting the severity', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await inspectorPO.selectSeverity('info');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('info');
        await inspectorPO.selectSeverity('warn');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
        await inspectorPO.selectSeverity('error');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('error');
      });

      test('should overwrite the severity if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectSeverity('warn');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('warn');
        await inspectorPO.selectSeverity('error');
        await expect(await inspectorPO.notificationPO.getSeverity()).toEqual('error');
      });

      test('should append CSS class(es)', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass(['testee', 'A', 'B']);
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await expect(await inspectorPO.notificationPO.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B']));
        await inspectorPO.enterCssClass('C D');
        await expect(await inspectorPO.notificationPO.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
      });

      test('should allow setting the auto-close duration', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});
        const notificationDuration = 1; // 1 second

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await inspectorPO.enterTitle('Notification should close after 1s');
        await inspectorPO.selectDuration(notificationDuration);

        await inspectorPO.waitUntilClosed(notificationDuration * 1000 + 500);
        await expect(await inspectorPO.isPresent()).toBe(false);
      });

      test('should overwrite the auto-close duration if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});
        const notificationDuration = 1; // 1 second

        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.enterCssClass('testee');
        await notificationOpenerPagePO.enterTitle('Notification should close after the `long` alias expires');
        await notificationOpenerPagePO.selectDuration('long');
        await notificationOpenerPagePO.selectComponent('inspect-notification');
        await notificationOpenerPagePO.clickShow();

        const inspectorPO = new InspectNotificationPO(appPO, 'testee');
        await expect(await inspectorPO.isVisible()).toBe(true);
        await inspectorPO.enterTitle('Notification should close after 1s');
        await inspectorPO.selectDuration(notificationDuration);

        await inspectorPO.waitUntilClosed(notificationDuration * 1000 + 500);
        await expect(await inspectorPO.isPresent()).toBe(false);
      });

      test('should not reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectorPage1PO = new InspectNotificationPO(appPO, 'testee-1');
        const inspectorPage2PO = new InspectNotificationPO(appPO, 'testee-2');
        const inspectorPage3PO = new InspectNotificationPO(appPO, 'testee-3');
        const inspectorPage4PO = new InspectNotificationPO(appPO, 'testee-4');
        const inspectorPage5PO = new InspectNotificationPO(appPO, 'testee-5');
        const inspectorPage6PO = new InspectNotificationPO(appPO, 'testee-6');

        // display the notifications of group-1
        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.checkUseGroupInputReduceFn(false); // do not use a reducer (default)
        await notificationOpenerPagePO.enterGroup('group-1');
        await notificationOpenerPagePO.selectComponent('inspect-notification');

        await notificationOpenerPagePO.enterCssClass('testee-1');
        await notificationOpenerPagePO.enterComponentInput('A');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage1PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage1PO.getInput()).toEqual('A');

        await notificationOpenerPagePO.enterCssClass('testee-2');
        await notificationOpenerPagePO.enterComponentInput('B');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage2PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage2PO.getInput()).toEqual('B');

        await notificationOpenerPagePO.enterCssClass('testee-3');
        await notificationOpenerPagePO.enterComponentInput('C');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage3PO.isVisible()).toBe(true);
        await expect(await inspectorPage3PO.getInput()).toEqual('C');

        // display the notifications of group-2
        await notificationOpenerPagePO.enterGroup('group-2');
        await notificationOpenerPagePO.enterComponentInput('D');
        await notificationOpenerPagePO.enterCssClass('testee-4');
        await notificationOpenerPagePO.clickShow();

        await expect(await inspectorPage4PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage4PO.getInput()).toEqual('D');

        await notificationOpenerPagePO.enterCssClass('testee-5');
        await notificationOpenerPagePO.enterComponentInput('E');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage5PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage5PO.getInput()).toEqual('E');

        await notificationOpenerPagePO.enterCssClass('testee-6');
        await notificationOpenerPagePO.enterComponentInput('F');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage6PO.isVisible()).toBe(true);
        await expect(await inspectorPage6PO.getInput()).toEqual('F');
      });

      test('should reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectorPage1PO = new InspectNotificationPO(appPO, 'testee-1');
        const inspectorPage2PO = new InspectNotificationPO(appPO, 'testee-2');
        const inspectorPage3PO = new InspectNotificationPO(appPO, 'testee-3');
        const inspectorPage4PO = new InspectNotificationPO(appPO, 'testee-4');
        const inspectorPage5PO = new InspectNotificationPO(appPO, 'testee-5');
        const inspectorPage6PO = new InspectNotificationPO(appPO, 'testee-6');

        // display the notifications of group-1
        const notificationOpenerPagePO = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPagePO.checkUseGroupInputReduceFn(true); // Use test reducer which concatenates notification inputs
        await notificationOpenerPagePO.enterGroup('group-1');
        await notificationOpenerPagePO.selectComponent('inspect-notification');

        await notificationOpenerPagePO.enterCssClass('testee-1');
        await notificationOpenerPagePO.enterComponentInput('A');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage1PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage1PO.getInput()).toEqual('A');

        await notificationOpenerPagePO.enterCssClass('testee-2');
        await notificationOpenerPagePO.enterComponentInput('B');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage2PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage2PO.getInput()).toEqual('A, B');

        await notificationOpenerPagePO.enterCssClass('testee-3');
        await notificationOpenerPagePO.enterComponentInput('C');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectorPage3PO.isVisible()).toBe(true);
        await expect(await inspectorPage3PO.getInput()).toEqual('A, B, C');

        // display the notifications of group-2
        await notificationOpenerPagePO.enterGroup('group-2');
        await notificationOpenerPagePO.enterComponentInput('D');
        await notificationOpenerPagePO.enterCssClass('testee-4');
        await notificationOpenerPagePO.clickShow();

        await expect(await inspectorPage4PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage4PO.getInput()).toEqual('D');

        await notificationOpenerPagePO.enterCssClass('testee-5');
        await notificationOpenerPagePO.enterComponentInput('E');
        await notificationOpenerPagePO.clickShow();
        await expect(await inspectorPage5PO.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage5PO.getInput()).toEqual('D, E');

        await notificationOpenerPagePO.enterCssClass('testee-6');
        await notificationOpenerPagePO.enterComponentInput('F');
        await notificationOpenerPagePO.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectorPage6PO.isVisible()).toBe(true);
        await expect(await inspectorPage6PO.getInput()).toEqual('D, E, F');
      });
    });
  });
});
