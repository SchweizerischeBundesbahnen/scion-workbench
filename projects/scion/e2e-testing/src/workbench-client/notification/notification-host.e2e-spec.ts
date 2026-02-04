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
import {canMatchWorkbenchNotificationCapability} from '../../workbench/page-object/layout-page/register-route-page.po';
import {WorkbenchNotificationCapability} from '../page-object/register-workbench-capability-page.po';
import {NotificationPagePO} from '../../workbench/page-object/notification-page.po';
import {expect} from '@playwright/test';

test.describe('Workbench Notification Host', () => {

  test('should show notification with specified host component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    const notificationCapability: WorkbenchNotificationCapability = {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: '',
      },
      private: false,
    };
    await microfrontendNavigator.registerCapability('host', notificationCapability);

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

    const notificationCapability: WorkbenchNotificationCapability = {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: '',
      },
      private: false,
    };
    await microfrontendNavigator.registerCapability('host', notificationCapability);

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

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability('host', {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: '',
        size: {
          height: '50px', // make notification small, so qualifier can be cleared
        },
      },
      private: false,
    });

    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'info',
      group: 'GROUP-1',
      cssClass: 'testee-1',
    });

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'warn',
      group: 'GROUP-1',
      cssClass: 'testee-2',
    });

    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show({component: 'testee'}, {
      severity: 'error',
      group: 'GROUP-1',
      cssClass: 'testee-3',
    });

    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
    await expect(appPO.notifications).toHaveCount(1);

    await notificationOpenerPage.show({component: 'testee'}, {
      group: 'GROUP-2',
      cssClass: 'testee-4',
    });

    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should pass params to the notification component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.registerRoute({
      path: '',
      component: 'notification-page',
      canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
    });

    await microfrontendNavigator.registerCapability('host', {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
      private: false,
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
    await appPO.navigateTo({microfrontendSupport: true});

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
    });

    await expect.poll(() => notificationPage.notification.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
    } satisfies Partial<CSSStyleDeclaration>);
  });

  test.describe('Severity', () => {
    test('should show notification with info severity', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await workbenchNavigator.registerRoute({
        path: '',
        component: 'notification-page',
        canMatch: [canMatchWorkbenchNotificationCapability({component: 'testee'})],
      });

      const notificationCapability: WorkbenchNotificationCapability = {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: '',
        },
        private: false,
      };
      await microfrontendNavigator.registerCapability('host', notificationCapability);

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

      const notificationCapability: WorkbenchNotificationCapability = {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: '',
        },
        private: false,
      };
      await microfrontendNavigator.registerCapability('host', notificationCapability);

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

      const notificationCapability: WorkbenchNotificationCapability = {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: '',
        },
        private: false,
      };
      await microfrontendNavigator.registerCapability('host', notificationCapability);

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'error'});

      const notification = appPO.notification({cssClass: 'testee'});
      await expect(notification.getSeverity()).resolves.toBe('error');
    });
  });
});
