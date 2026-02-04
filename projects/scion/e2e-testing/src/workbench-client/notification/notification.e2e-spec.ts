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
import {FocusTestPagePO} from '../page-object/test-pages/focus-test-page.po';
import {MAIN_AREA} from '../../workbench.model';

test.describe('Workbench Notification Mircrofrontend', () => {

  test('should show notification', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-notification',
        size: {
          height: '100px',
        },
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
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-notification',
        size: {
          height: '100px',
        },
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
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-notification',
        size: {
          height: '100px',
        },
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

  test('should not focus notification on open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-pages/focus-test-page',
        size: {
          height: '100px',
        },
      },
    });

    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const focusTestPage = new FocusTestPagePO(notification);
    await expectNotification(focusTestPage).toBeVisible();
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);
  });

  test('should focus notification on title click', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {
        component: 'testee',
      },
      properties: {
        path: 'test-pages/focus-test-page',
        size: {
          height: '100px',
        },
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
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
        qualifier: {
          component: 'testee',
        },
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
          size: {
            height: '100px',
          },
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
        qualifier: {
          component: 'testee',
        },
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
      await expect.poll(() => notificationPage.notification.getBoundingBox()).toEqual(expect.objectContaining({
        height: 500,
        width: 350,
      }));

      await expect.poll(() => notificationPage.notification.getComputedStyle()).toEqual(expect.objectContaining({
        height: '500px',
        minHeight: '495px',
        maxHeight: '505px',
      } satisfies Partial<CSSStyleDeclaration>));
    });
  });

  test.describe('Close', () => {

    test('should close notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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

      await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
        type: 'notification',
        qualifier: {
          component: 'testee',
        },
        properties: {
          path: 'test-notification',
          size: {
            height: '100px',
          },
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
