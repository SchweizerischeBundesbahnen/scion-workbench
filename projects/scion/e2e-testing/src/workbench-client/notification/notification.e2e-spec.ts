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
import {WorkbenchNotificationCapability} from '../page-object/register-workbench-capability-page.po';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {NotificationPagePO} from '../page-object/notification-page.po';
import {expectNotification} from '../../matcher/notification-matcher';
import {expect} from '@playwright/test';

test.describe('Workbench Notification Mircrofrontend', () => {
  test('should pass capability to the notification component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationCapability: WorkbenchNotificationCapability = {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-notification',
      }
    };
    await microfrontendNavigator.registerCapability('app1', notificationCapability);

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', duration: 'infinite'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.getNotificationCapability()).resolves.toMatchObject(notificationCapability);
  });

  test.describe('Params', () => {
    test('should pass params to the notification component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-notification',
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', duration: 'infinite', params: { id: '123' }});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.getNotificationParams()).resolves.toEqual({ id: '123' });
    });

    test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {

      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        params: [
          {name: 'seg1', required: true},
          {name: 'mp1', required: true},
          {name: 'qp1', required: true},
          {name: 'fragment', required: true},
        ],
        properties: {
          path: 'test-pages/notification-test-page/:seg1/segment2;mp1=:mp1?qp1=:qp1#:fragment',
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {
        cssClass: 'testee',
        duration: 'infinite',
        params: {seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'},
      });

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.getNotificationParams()).resolves.toEqual({seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'});
      await expect(notificationPage.getRouteParams()).resolves.toEqual({segment1: 'SEG1', mp1: 'MP1'});
      await expect(notificationPage.getRouteQueryParams()).resolves.toEqual({qp1: 'QP1'});
      await expect(notificationPage.getRouteFragment()).resolves.toEqual('FRAGMENT');
    });
  });

  test.describe('Close', () => {
    test('should close notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', duration: 'infinite'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();

      // Close notification
      await notificationPage.close();

      await expectNotification(notificationPage).not.toBeAttached();
    });

    test('should close notification by pressing ESCAPE', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', duration: 'infinite'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();

      // Close notification
      await page.keyboard.press('Escape');

      await expectNotification(notificationPage).not.toBeAttached();
    });
  });
});