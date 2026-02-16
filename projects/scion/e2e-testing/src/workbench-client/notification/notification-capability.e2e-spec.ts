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
import {expect} from '@playwright/test';
import {WorkbenchNotificationCapability} from '../page-object/register-workbench-capability-page.po';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';
import {NotificationPagePO} from '../page-object/notification-page.po';
import {expectNotification} from '../../matcher/notification-matcher';

test.describe('Workbench Notification Capability', () => {

  test('should pass capability to the notification component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const notificationCapability: WorkbenchNotificationCapability = {
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
    };
    await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', notificationCapability);

    // Display the notification.
    const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
    await notificationOpenerPage.show({component: 'testee'}, {cssClass: 'testee'});

    const notification = appPO.notification({cssClass: 'testee'});
    const notificationPage = new NotificationPagePO(notification);

    await expectNotification(notificationPage).toBeVisible();
    await expect(notificationPage.getNotificationCapability()).resolves.toMatchObject(notificationCapability);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
        size: {
          height: '100px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capabilities require a path/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '<null>',
        size: {
          height: '100px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capabilities require a path/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {
          height: '100px',
        },
      },
    });

    expect(registeredCapability.properties.path).toEqual('');
  });

  test('should require empty path if host notification capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('non-empty path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: 'path/to/notification',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capabilities of the host application require an empty/);
    });

    await test.step('null path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: '<null>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capabilities of the host application require an empty/);
    });

    await test.step('undefined path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: '<undefined>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capabilities of the host application require an empty/);
    });

    await test.step('empty path', async () => {
      const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
        type: 'notification',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });
      expect(registeredCapability.properties.path).toEqual('');
    });
  });

  test('should error if having no qualifier for capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {},
      properties: {
        path: '',
        size: {
          height: '100px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capability requires a qualifier/);
  });

  test('should error if host capability defines "showSplash" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('host', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        showSplash: true,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Property "showSplash" not supported for notification capabilities of the host application/);
  });

  test('should not error if capability defines "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/notification',
        showSplash: true,
        size: {height: '400px'},
      },
    });

    expect(registeredCapability.properties.showSplash).toBe(true);
  });

  test('should error if size is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/notification',
        size: undefined,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capability requires the 'size' property with a height/);
  });

  test('should error if height is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchNotificationCapability>('app1', {
      type: 'notification',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/notification',
        size: {
          height: '<undefined>',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[NotificationDefinitionError] Notification capability requires the 'size' property with a height/);
  });
});
