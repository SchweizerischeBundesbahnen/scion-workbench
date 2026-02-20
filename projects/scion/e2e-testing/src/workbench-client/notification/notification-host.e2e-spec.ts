/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {expectNotification} from '../../matcher/notification-matcher';
import {canMatchWorkbenchNotificationCapability, canMatchWorkbenchViewCapability} from '../../workbench/page-object/layout-page/register-route-page.po';
import {WorkbenchNotificationCapability, WorkbenchViewCapability} from '../page-object/register-workbench-capability-page.po';
import {NotificationPagePO} from '../../workbench/page-object/notification-page.po';
import {expect} from '@playwright/test';
import {MAIN_AREA} from '../../workbench.model';
import {RouterPagePO} from '../page-object/router-page.po';

test.describe('Workbench Notification Host', () => {

  test('should show notification with specified host component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
  });

  test('should show notification with title', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', title: 'title'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notification.title).toHaveText('title');
  });

  test('should replace notifications of the same group', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part']),
    );

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Open notification 1.
    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'info',
      group: 'GROUP-1',
      cssClass: 'testee-1',
    });

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 2.
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'warn',
      group: 'GROUP-1',
      cssClass: 'testee-2',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 3.
    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'error',
      group: 'GROUP-1',
      cssClass: 'testee-3',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 4.
    const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      group: 'GROUP-2',
      cssClass: 'testee-4',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should replace notifications of the same group when opening notifications in quick succession', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register notification params reducer.
    const reducerTopic = 'notifications-reducer';
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'reducer'},
      properties: {
        path: '',
      },
    });

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-param-reducer-test-page',
      data: {topic: reducerTopic, delay: 500},
      canMatch: [canMatchWorkbenchViewCapability({component: 'reducer'})],
    });

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
        groupParamsReducer: reducerTopic,
      },
    });

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    // Install notification params reducer by opening the reducer test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'reducer'});

    // Open multiple notification of the same group.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {
      count: 5,
      params: {param: 'value'},
      group: 'group',
      cssClass: 'testee',
    });

    const notificationPage = new NotificationPagePO(appPO.notification({cssClass: 'testee'}));
    await expectNotification(notificationPage).toBeVisible();
    await expect(appPO.notifications).toHaveCount(1);

    // Use `toPass` together with `poll` to have a stable assertion, required because the notification page may be replaced during assertion, prevening interaction with the accordion otherwise.
    await expect(() => expect.poll(() => notificationPage.activatedMicrofrontend.getParams(), {timeout: 3_000}).toEqual({param: 'value, value, value, value, value'})).toPass();
  });

  test('should reduce the params of notifications in the same group', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part']),
    );

    // Register notification params reducer.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'reducer'},
      properties: {
        path: '',
      },
    });

    const reducerTopic = 'notifications-reducer';
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-param-reducer-test-page',
      data: {topic: reducerTopic},
      canMatch: [canMatchWorkbenchViewCapability({component: 'reducer'})],
    });

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
        groupParamsReducer: reducerTopic,
      },
    });

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    // Install notification params reducer by opening the reducer test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'reducer'});

    // Open notification 1.
    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-1'},
      group: 'GROUP-1',
      cssClass: 'testee-1',
    });

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.activatedMicrofrontend.getParams()).toEqual({param: 'testee-1'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 2.
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-2'},
      group: 'GROUP-1',
      cssClass: 'testee-2',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.activatedMicrofrontend.getParams()).toEqual({param: 'testee-1, testee-2'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 3.
    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-3'},
      group: 'GROUP-1',
      cssClass: 'testee-3',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.activatedMicrofrontend.getParams()).toEqual({param: 'testee-1, testee-2, testee-3'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 4.
    const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee'},
      group: 'GROUP-2',
      cssClass: 'testee-4',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect.poll(() => notificationPage4.activatedMicrofrontend.getParams()).toEqual({param: 'testee'});
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should pass params to the notification component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Show the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', params: {param: '123'}});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect params.
    await expect.poll(() => notificationPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

  test('should size the notification as configured in the capability', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    // Register host notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
        },
      },
    });

    // Register host notification route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'notification-page', canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    // Show the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect the notification page to display with the defined size.
    await expect.poll(() => notificationPage.notification.getBoundingBox()).toMatchObject({
      height: 500,
      width: 350,
    });

    await expect.poll(() => notificationPage.notification.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
    } satisfies Partial<CSSStyleDeclaration>);
  });

  test('should adapt notification height to content', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {
          height: 'auto',
        },
      },
    });

    // Register host notification route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'notification-page', canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();

    // Capture current size.
    const notificationBounds = await notification.getBoundingBox();
    const notificationSlotBounds = await notification.getBoundingBox('slot');
    const padding = notificationBounds.height - notificationSlotBounds.height;

    // Change the size of the content.
    await notificationPage.enterContentSize({height: '800px'});

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });

    // Shrink the content.
    await notificationPage.enterContentSize({
      height: '400px',
    });

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 400 + padding,
      width: 350,
    });

    // Grow the content.
    await notificationPage.enterContentSize({
      height: '800px',
    });

    // Expect the notification to adapt to the content size.
    await expect.poll(() => notification.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => notification.getBoundingBox()).toMatchObject({
      height: 800 + padding,
      width: 350,
    });
  });

  test('should, by default, show notification with info severity', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(notification.getSeverity()).resolves.toBe('info');
  });

  test('should show notification with info severity', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'info'});

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(notification.getSeverity()).resolves.toBe('info');
  });

  test('should show notification with warn severity', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'warn'});

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(notification.getSeverity()).resolves.toBe('warn');
  });

  test('should show notification with error severity', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'error'});

    const notification = appPO.notification({cssClass: 'testee'});
    await expect(notification.getSeverity()).resolves.toBe('error');
  });
});
