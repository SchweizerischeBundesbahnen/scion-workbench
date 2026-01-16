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
      private: false
    };
    await microfrontendNavigator.registerCapability('host', notificationCapability);

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({ component: 'testee' }, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
  });

  test('should pass params to the messagebox component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
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
      private: false
    });

    // Open the message box.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', params: {param: '123'}});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    // Expect params.
    await expect.poll(() => notificationPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

});