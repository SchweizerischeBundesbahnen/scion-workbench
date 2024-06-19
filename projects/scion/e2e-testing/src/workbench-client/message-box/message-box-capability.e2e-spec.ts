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

test.describe('Workbench Message Box Capability', () => {

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '<null>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    expect(registeredCapability.properties.path).toEqual('');
  });

  test('should error if having no qualifier for capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {},
      properties: {
        path: '',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullQualifierError/);
  });
});
