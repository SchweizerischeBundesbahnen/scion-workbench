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
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

test.describe('Workbench Notification', () => {

  test('should show a notification with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('TEXT');
    await notificationOpenerPage.clickShow();

    const textNotificationComponent = new TextNotificationComponentPO(appPO, 'testee');
    await expect(await textNotificationComponent.isVisible()).toBe(true);
    await expect(await textNotificationComponent.getText()).toEqual('TEXT');
  });

  test('should support new lines in the notification text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('LINE 1\\nLINE 2');
    await notificationOpenerPage.clickShow();

    const textNotificationComponent = new TextNotificationComponentPO(appPO, 'testee');
    await expect(await textNotificationComponent.isVisible()).toBe(true);
    await expect(await textNotificationComponent.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should close the last notification when pressing the ESC key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee-1');

    await notificationOpenerPage.clickShow();
    await notificationOpenerPage.enterCssClass('testee-2');

    await notificationOpenerPage.clickShow();
    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    await expect(await notification1.isVisible()).toBe(true);
    await expect(await notification2.isVisible()).toBe(true);
    await expect(await notification3.isVisible()).toBe(true);

    await notificationOpenerPage.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(2);
    await expect(await notification1.isVisible()).toBe(true);
    await expect(await notification2.isVisible()).toBe(true);
    await expect(await notification3.isPresent()).toBe(false);

    await notificationOpenerPage.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(1);
    await expect(await notification1.isVisible()).toBe(true);
    await expect(await notification2.isPresent()).toBe(false);
    await expect(await notification3.isPresent()).toBe(false);

    await notificationOpenerPage.pressEscape();
    await expect(await appPO.getNotificationCount()).toEqual(0);
    await expect(await notification1.isPresent()).toBe(false);
    await expect(await notification2.isPresent()).toBe(false);
    await expect(await notification3.isPresent()).toBe(false);
  });

  test('should close the notification when clicking the close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('TEXT');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await notification.clickClose();
    await expect(await notification.isVisible()).toBe(false);
  });

  test('should stack multiple notifications', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});

    await notificationOpenerPage.enterCssClass('testee-1');
    await notificationOpenerPage.clickShow();

    await notificationOpenerPage.enterCssClass('testee-2');
    await notificationOpenerPage.clickShow();

    await notificationOpenerPage.enterCssClass('testee-3');
    await notificationOpenerPage.clickShow();

    await expect(await appPO.getNotificationCount()).toEqual(3);
    const clientRect1 = await notification1.getBoundingBox();
    const clientRect2 = await notification2.getBoundingBox();
    const clientRect3 = await notification3.getBoundingBox();

    expect(clientRect1.bottom).toBeLessThan(clientRect2.top);
    expect(clientRect2.bottom).toBeLessThan(clientRect3.top);
    expect(clientRect1.left).toEqual(clientRect2.left);
    expect(clientRect1.left).toEqual(clientRect3.left);
  });

  test('should display a notification with the specified title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('TITLE');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the notification title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, show a notification with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('info');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('info');
  });

  test('should show a notification with warn serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('warn');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('warn');
  });

  test('should show a notification with error serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.selectSeverity('error');
    await notificationOpenerPage.clickShow();

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(await notification.isVisible()).toBe(true);
    await expect(await notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const notification1 = appPO.notification({cssClass: 'testee-1'});
    const notification2 = appPO.notification({cssClass: 'testee-2'});
    const notification3 = appPO.notification({cssClass: 'testee-3'});
    const notification4 = appPO.notification({cssClass: 'testee-4'});

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
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

  test('should close the notification after the auto-close timeout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const notificationDuration = 1; // 1 second

    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
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

    test.describe('Custom Message Component', () => {
      test('should allow displaying a custom component', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isPresent()).toBe(true);
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
      });

      test('should pass the input', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.enterComponentInput('ABC');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent.getInput()).toEqual('ABC');
      });

      test('should allow setting the title', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await inspectNotificationComponent.enterTitle('TITLE');
        await expect(await inspectNotificationComponent.notification.getTitle()).toEqual('TITLE');
      });

      test('should overwrite the title if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.enterTitle('title');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await inspectNotificationComponent.enterTitle('TITLE');
        await expect(await inspectNotificationComponent.notification.getTitle()).toEqual('TITLE');
      });

      test('should allow setting the severity', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await inspectNotificationComponent.selectSeverity('info');
        await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('info');
        await inspectNotificationComponent.selectSeverity('warn');
        await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('warn');
        await inspectNotificationComponent.selectSeverity('error');
        await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('error');
      });

      test('should overwrite the severity if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectSeverity('warn');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('warn');
        await inspectNotificationComponent.selectSeverity('error');
        await expect(await inspectNotificationComponent.notification.getSeverity()).toEqual('error');
      });

      test('should append CSS class(es)', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass(['testee', 'A', 'B']);
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent.notification.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B']));
        await inspectNotificationComponent.enterCssClass('C D');
        await expect(await inspectNotificationComponent.notification.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
      });

      test('should allow setting the auto-close duration', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});
        const notificationDuration = 1; // 1 second

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await inspectNotificationComponent.enterTitle('Notification should close after 1s');
        await inspectNotificationComponent.selectDuration(notificationDuration);

        await inspectNotificationComponent.waitUntilClosed(notificationDuration * 1000 + 500);
        await expect(await inspectNotificationComponent.isPresent()).toBe(false);
      });

      test('should overwrite the auto-close duration if also passed by the notification reporter', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});
        const notificationDuration = 1; // 1 second

        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.enterCssClass('testee');
        await notificationOpenerPage.enterTitle('Notification should close after the `long` alias expires');
        await notificationOpenerPage.selectDuration('long');
        await notificationOpenerPage.selectComponent('inspect-notification');
        await notificationOpenerPage.clickShow();

        const inspectNotificationComponent = new InspectNotificationComponentPO(appPO, 'testee');
        await expect(await inspectNotificationComponent.isVisible()).toBe(true);
        await inspectNotificationComponent.enterTitle('Notification should close after 1s');
        await inspectNotificationComponent.selectDuration(notificationDuration);

        await inspectNotificationComponent.waitUntilClosed(notificationDuration * 1000 + 500);
        await expect(await inspectNotificationComponent.isPresent()).toBe(false);
      });

      test('should not reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectNotificationComponent1 = new InspectNotificationComponentPO(appPO, 'testee-1');
        const inspectNotificationComponent2 = new InspectNotificationComponentPO(appPO, 'testee-2');
        const inspectNotificationComponent3 = new InspectNotificationComponentPO(appPO, 'testee-3');
        const inspectNotificationComponent4 = new InspectNotificationComponentPO(appPO, 'testee-4');
        const inspectNotificationComponent5 = new InspectNotificationComponentPO(appPO, 'testee-5');
        const inspectNotificationComponent6 = new InspectNotificationComponentPO(appPO, 'testee-6');

        // display the notifications of group-1
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.checkUseGroupInputReduceFn(false); // do not use a reducer (default)
        await notificationOpenerPage.enterGroup('group-1');
        await notificationOpenerPage.selectComponent('inspect-notification');

        await notificationOpenerPage.enterCssClass('testee-1');
        await notificationOpenerPage.enterComponentInput('A');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent1.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent1.getInput()).toEqual('A');

        await notificationOpenerPage.enterCssClass('testee-2');
        await notificationOpenerPage.enterComponentInput('B');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent2.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent2.getInput()).toEqual('B');

        await notificationOpenerPage.enterCssClass('testee-3');
        await notificationOpenerPage.enterComponentInput('C');
        await notificationOpenerPage.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent3.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent3.getInput()).toEqual('C');

        // display the notifications of group-2
        await notificationOpenerPage.enterGroup('group-2');
        await notificationOpenerPage.enterComponentInput('D');
        await notificationOpenerPage.enterCssClass('testee-4');
        await notificationOpenerPage.clickShow();

        await expect(await inspectNotificationComponent4.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent4.getInput()).toEqual('D');

        await notificationOpenerPage.enterCssClass('testee-5');
        await notificationOpenerPage.enterComponentInput('E');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent5.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent5.getInput()).toEqual('E');

        await notificationOpenerPage.enterCssClass('testee-6');
        await notificationOpenerPage.enterComponentInput('F');
        await notificationOpenerPage.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent6.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent6.getInput()).toEqual('F');
      });

      test('should reduce the input of notifications in the same group', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        const inspectNotificationComponent1 = new InspectNotificationComponentPO(appPO, 'testee-1');
        const inspectNotificationComponent2 = new InspectNotificationComponentPO(appPO, 'testee-2');
        const inspectNotificationComponent3 = new InspectNotificationComponentPO(appPO, 'testee-3');
        const inspectNotificationComponent4 = new InspectNotificationComponentPO(appPO, 'testee-4');
        const inspectNotificationComponent5 = new InspectNotificationComponentPO(appPO, 'testee-5');
        const inspectNotificationComponent6 = new InspectNotificationComponentPO(appPO, 'testee-6');

        // display the notifications of group-1
        const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
        await notificationOpenerPage.checkUseGroupInputReduceFn(true); // Use test reducer which concatenates notification inputs
        await notificationOpenerPage.enterGroup('group-1');
        await notificationOpenerPage.selectComponent('inspect-notification');

        await notificationOpenerPage.enterCssClass('testee-1');
        await notificationOpenerPage.enterComponentInput('A');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent1.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent1.getInput()).toEqual('A');

        await notificationOpenerPage.enterCssClass('testee-2');
        await notificationOpenerPage.enterComponentInput('B');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent2.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent2.getInput()).toEqual('A, B');

        await notificationOpenerPage.enterCssClass('testee-3');
        await notificationOpenerPage.enterComponentInput('C');
        await notificationOpenerPage.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(1);
        await expect(await inspectNotificationComponent3.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent3.getInput()).toEqual('A, B, C');

        // display the notifications of group-2
        await notificationOpenerPage.enterGroup('group-2');
        await notificationOpenerPage.enterComponentInput('D');
        await notificationOpenerPage.enterCssClass('testee-4');
        await notificationOpenerPage.clickShow();

        await expect(await inspectNotificationComponent4.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent4.getInput()).toEqual('D');

        await notificationOpenerPage.enterCssClass('testee-5');
        await notificationOpenerPage.enterComponentInput('E');
        await notificationOpenerPage.clickShow();
        await expect(await inspectNotificationComponent5.isVisible()).toBe(true);
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent5.getInput()).toEqual('D, E');

        await notificationOpenerPage.enterCssClass('testee-6');
        await notificationOpenerPage.enterComponentInput('F');
        await notificationOpenerPage.clickShow();
        await expect(await appPO.getNotificationCount()).toEqual(2);
        await expect(await inspectNotificationComponent6.isVisible()).toBe(true);
        await expect(await inspectNotificationComponent6.getInput()).toEqual('D, E, F');
      });
    });
  });
});
