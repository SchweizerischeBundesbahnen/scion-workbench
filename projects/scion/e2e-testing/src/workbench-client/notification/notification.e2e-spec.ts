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
import {WorkbenchNotificationCapability, WorkbenchViewCapability} from '../page-object/register-workbench-capability-page.po';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {NotificationPagePO} from '../page-object/notification-page.po';
import {expectNotification} from '../../matcher/notification-matcher';
import {expect} from '@playwright/test';
import {FocusTestPagePO} from '../page-object/test-pages/focus-test-page.po';
import {MAIN_AREA} from '../../workbench.model';
import {RouterPagePO} from '../page-object/router-page.po';

test.describe('Workbench Notification Microfrontend', () => {

  test('should show notification', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
  });

  test('should show notification with title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Open notification 1.
    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

  test('should replace notifications of the same group and capability', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part']),
    );

    // Register notification capability 1 in app 1.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Register notification capability 2 in app 1.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Register notification capability 3 in app 2.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app2', {
      type: 'notification',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Register intention for app 1 to open notifications of app 2.
    await microfrontendNavigator.registerIntention('app1', {type: 'notification', qualifier: {component: 'testee-3'}});

    // Open notification 1.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await notificationOpenerPage.show({component: 'testee-1'}, {
      group: 'group',
      severity: 'info',
      cssClass: 'testee-1',
    });

    // Open notification 2.
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await notificationOpenerPage.show({component: 'testee-2'}, {
      group: 'group',
      severity: 'warn',
      cssClass: 'testee-2',
    });

    // Open notification 3.
    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await notificationOpenerPage.show({component: 'testee-3'}, {
      group: 'group',
      severity: 'error',
      cssClass: 'testee-3',
    });

    await expect(appPO.notifications).toHaveCount(3);

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');

    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');

    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
  });

  test('should not replace notifications of the same group and capability opened from different apps', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part']),
    );

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-notification',
        size: {height: 'auto'},
      },
    });

    // Register intention for app 2 to open notifications of app 1.
    await microfrontendNavigator.registerIntention('app2', {type: 'notification', qualifier: {component: 'testee'}});

    // Register intention for host app to open notifications of app 1.
    await microfrontendNavigator.registerIntention('host', {type: 'notification', qualifier: {component: 'testee'}});

    // Open notification from app 1.
    const notificationOpenerPageApp1 = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await notificationOpenerPageApp1.show({component: 'testee'}, {
      group: 'group',
      severity: 'info',
      cssClass: 'testee-1',
    });

    await expect(appPO.notifications).toHaveCount(1);
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');

    // Open notification from app 2.
    const notificationOpenerPageApp2 = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app2');
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await notificationOpenerPageApp2.show({component: 'testee'}, {
      group: 'group',
      severity: 'warn',
      cssClass: 'testee-2',
    });

    // Open notification from host app.
    const notificationOpenerPageHostApp = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await notificationOpenerPageHostApp.show({component: 'testee'}, {
      group: 'group',
      severity: 'error',
      cssClass: 'testee-3',
    });

    await expect(appPO.notifications).toHaveCount(3);

    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.notification.getSeverity()).toEqual('info');

    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.notification.getSeverity()).toEqual('warn');

    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.notification.getSeverity()).toEqual('error');
  });

  test('should replace notifications of the same group when opening notifications in quick succession', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register notification params reducer.
    const reducerTopic = 'notifications-reducer';
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'reducer'},
      properties: {
        path: `test-pages/notification-param-reducer-test-page;topic=${reducerTopic};delay=500`,
      },
    });

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: 'test-notification',
        groupParamsReducer: reducerTopic,
        size: {height: 'auto'},
      },
    });

    // Install notification params reducer by opening the reducer test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'reducer'});

    // Open multiple notification of the same group.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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
    await expect(() => expect.poll(() => notificationPage.getNotificationParams(), {timeout: 3_000}).toEqual({param: 'value, value, value, value, value'})).toPass();
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
    const reducerTopic = 'notifications-reducer';
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'reducer'},
      properties: {
        path: `test-pages/notification-param-reducer-test-page;topic=${reducerTopic}`,
      },
    });

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: 'test-notification',
        groupParamsReducer: reducerTopic,
        size: {height: 'auto'},
      },
    });

    // Install notification params reducer by opening the reducer test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'reducer'});

    // Open notification 1.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-1'},
      group: 'GROUP-1',
      cssClass: 'testee-1',
    });

    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.getNotificationParams()).toEqual({param: 'testee-1'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 2.
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-2'},
      group: 'GROUP-1',
      cssClass: 'testee-2',
    });

    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.getNotificationParams()).toEqual({param: 'testee-1, testee-2'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 3.
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-3'},
      group: 'GROUP-1',
      cssClass: 'testee-3',
    });

    const notificationPage3 = new NotificationPagePO(appPO.notification({cssClass: 'testee-3'}));
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expect.poll(() => notificationPage3.getNotificationParams()).toEqual({param: 'testee-1, testee-2, testee-3'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 4.
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee'},
      group: 'GROUP-2',
      cssClass: 'testee-4',
    });
    const notificationPage4 = new NotificationPagePO(appPO.notification({cssClass: 'testee-4'}));
    await expectNotification(notificationPage1).not.toBeAttached();
    await expectNotification(notificationPage2).not.toBeAttached();
    await expectNotification(notificationPage3).toBeVisible();
    await expectNotification(notificationPage4).toBeVisible();
    await expect.poll(() => notificationPage4.getNotificationParams()).toEqual({param: 'testee'});
    await expect(appPO.notifications).toHaveCount(2);
  });

  test('should reduce the params of notifications in the same group (late group reducer installation)', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add part to the right for notifications to not cover the notification opener page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part']),
    );

    // Register notification params reducer.
    const reducerTopic = 'notifications-reducer';
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'reducer'},
      properties: {
        path: `test-pages/notification-param-reducer-test-page;topic=${reducerTopic}`,
      },
    });

    // Register notification capability.
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: 'test-notification',
        groupParamsReducer: reducerTopic,
        size: {height: 'auto'},
      },
    });

    // Open notification 1.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-1'},
      group: 'group',
      cssClass: 'testee-1',
    });

    const notificationPage1 = new NotificationPagePO(appPO.notification({cssClass: 'testee-1'}));
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.getNotificationParams()).toEqual({param: 'testee-1'});
    await expect(appPO.notifications).toHaveCount(1);

    // Open notification 2.
    await notificationOpenerPage.show({component: 'testee'}, {
      params: {param: 'testee-2'},
      group: 'group',
      cssClass: 'testee-2',
    });

    // Wait some time because only displayed when installed the reducer.
    await page.waitForTimeout(500);

    // Expect notification 1 to still display.
    await expectNotification(notificationPage1).toBeVisible();
    await expect.poll(() => notificationPage1.getNotificationParams()).toEqual({param: 'testee-1'});
    await expect(appPO.notifications).toHaveCount(1);

    // Install notification params reducer by opening the reducer test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'reducer'});

    // Expect notification 1 to be replaced by notification 2.
    const notificationPage2 = new NotificationPagePO(appPO.notification({cssClass: 'testee-2'}));
    await expectNotification(notificationPage2).toBeVisible();
    await expect.poll(() => notificationPage2.getNotificationParams()).toEqual({param: 'testee-1, testee-2'});
    await expect(appPO.notifications).toHaveCount(1);
  });

  test('should not focus notification on open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
        size: {height: 'auto'},
      },
    });

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});
    const notificationOpenerViewId = await notificationOpenerPage.view.getViewId();

    const notification = appPO.notification({cssClass: 'testee'});
    const focusTestPage = new FocusTestPagePO(notification);
    await expectNotification(focusTestPage).toBeVisible();
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);
    await expect.poll(() => appPO.focusOwner()).toEqual(notificationOpenerViewId);
  });

  test('should focus notification on title click', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
        size: {height: 'auto'},
      },
    });

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', title: 'title'});

    const notification = appPO.notification({cssClass: 'testee'});
    const focusTestPage = new FocusTestPagePO(notification);
    await expectNotification(focusTestPage).toBeVisible();

    await notification.title.click();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);
  });

  test.describe('Severity', () => {
    test('should, by default, show notification with info severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});

      await expect(notification.getSeverity()).resolves.toBe('info');
    });

    test('should show notification with info severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'info'});

      const notification = appPO.notification({cssClass: 'testee'});

      await expect(notification.getSeverity()).resolves.toBe('info');
    });

    test('should show notification with warn severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'warn'});

      const notification = appPO.notification({cssClass: 'testee'});
      await expect(notification.getSeverity()).resolves.toBe('warn');
    });

    test('should show notification with error severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', severity: 'error'});

      const notification = appPO.notification({cssClass: 'testee'});
      await expect(notification.getSeverity()).resolves.toBe('error');
    });
  });

  test.describe('Params', () => {
    test('should pass params to the notification component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', params: {id: '123'}});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();
      await expect(notificationPage.getNotificationParams()).resolves.toEqual({id: '123'});
    });

    test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        params: [
          {name: 'seg1', required: true},
          {name: 'mp1', required: true},
          {name: 'qp1', required: true},
          {name: 'fragment', required: true},
        ],
        properties: {
          path: 'test-pages/notification-test-page/:seg1/segment2;mp1=:mp1?qp1=:qp1#:fragment',
          size: {height: 'auto'},
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
      await expect.poll(() => notificationPage.getNotificationParams()).toEqual({seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'});
      await expect.poll(() => (notificationPage.getRouteParams())).toEqual({segment1: 'SEG1', mp1: 'MP1'});
      await expect.poll(() => (notificationPage.getRouteQueryParams())).toEqual({qp1: 'QP1'});
      await expect.poll(() => (notificationPage.getRouteFragment())).toEqual('FRAGMENT');
    });
  });

  test.describe('Size', () => {

    test('should size the notification as configured in the capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {
            height: '500px',
            minHeight: '495px',
            maxHeight: '505px',
          },
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
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

    test('should adapt notification height to content', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-notification-width': '350px'}});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {
            height: 'auto',
          },
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();

      // Capture current size.
      const notificationBounds = await notification.getBoundingBox();
      const notificationPageBounds = await notification.getBoundingBox('content');
      const padding = notificationBounds.height - notificationPageBounds.height;

      // Change the size of the content.
      await notificationPage.reportContentSize(true);
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
  });

  test.describe('Close', () => {

    test('should close notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
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

    test('should close last notification when pressing the ESC key', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
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

    test('should close focused notification when pressing the ESC key', async ({page, appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add part to the right for notifications to not cover the notification opener page.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {align: 'right'})
        .navigatePart('part.right', ['path/to/part']),
      );

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/focus-test-page',
          size: {height: 'auto'},
        },
      });

      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');

      // Open three notifications.
      const focusTestPage1 = new FocusTestPagePO(appPO.notification({cssClass: 'testee-1'}));
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee-1', duration: 'infinite'});
      await expectNotification(focusTestPage1).toBeVisible();

      const focusTestPage2 = new FocusTestPagePO(appPO.notification({cssClass: 'testee-2'}));
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee-2', duration: 'infinite'});
      await expectNotification(focusTestPage2).toBeVisible();

      const focusTestPage3 = new FocusTestPagePO(appPO.notification({cssClass: 'testee-3'}));
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee-3', duration: 'infinite'});
      await expectNotification(focusTestPage3).toBeVisible();

      // Focus second notification.
      await appPO.notification({cssClass: 'testee-2'}).locator.click();
      await expect.poll(() => focusTestPage2.isFocused()).toBe(true);

      // Press 'Escape' in focused notification.
      await page.keyboard.press('Escape');

      await expectNotification(focusTestPage1).toBeVisible();
      await expectNotification(focusTestPage2).not.toBeAttached();
      await expectNotification(focusTestPage3).toBeVisible();

      // Close topmost notification
      await page.keyboard.press('Escape');
      await expectNotification(focusTestPage1).toBeVisible();
      await expectNotification(focusTestPage2).not.toBeAttached();
      await expectNotification(focusTestPage3).not.toBeAttached();

      // Close topmost notification
      await page.keyboard.press('Escape');
      await expectNotification(focusTestPage1).not.toBeAttached();
      await expectNotification(focusTestPage2).not.toBeAttached();
      await expectNotification(focusTestPage3).not.toBeAttached();
    });

    test('should close notification via auxiliary mouse button', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-notification',
          size: {height: 'auto'},
        },
      });

      // Display the notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee', duration: 'infinite'});

      const notification = appPO.notification({cssClass: 'testee'});
      const notificationPage = new NotificationPagePO(notification);

      await expectNotification(notificationPage).toBeVisible();

      // Close notification by pressing the middle mouse button.
      await notificationPage.locator.click({button: 'middle'});

      // Expect notification to be closed.
      await expectNotification(notificationPage).not.toBeAttached();
    });
  });
});
