/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {WorkbenchMessageBoxCapability} from '../page-object/register-workbench-capability-page.po';

test.describe('Workbench Message Box Capability', () => {

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] MessageBox capabilities require a path/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '<null>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] MessageBox capabilities require a path/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    expect(registeredCapability.properties.path).toEqual('');
  });

  test('should require empty path if host messagebox capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('non-empty path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'path/to/messagebox',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] Messagebox capabilities of the host application require an empty/);
    });

    await test.step('null path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: '<null>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] Messagebox capabilities of the host application require an empty/);
    });

    await test.step('undefined path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: '<undefined>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] Messagebox capabilities of the host application require an empty/);
    });

    await test.step('empty path', async () => {
      const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
        type: 'messagebox',
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
      type: 'messagebox',
      qualifier: {},
      properties: {
        path: '',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] MessageBox capability requires a qualifier/);
  });

  test('should error if host capability defines "showSplash" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        showSplash: true,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[MessageBoxDefinitionError] Property "showSplash" not supported for messagebox capabilities of the host application/);
  });

  test('should not error if capability defines "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/messagebox',
        showSplash: true,
        size: {height: '400px', width: '300px'},
      },
    });

    expect(registeredCapability.properties.showSplash).toBe(true);
  });
});
