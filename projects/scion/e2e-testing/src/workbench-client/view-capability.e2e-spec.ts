/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';

test.describe('Workbench View Capability', () => {

  test('should assign stable identifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability: WorkbenchViewCapability = {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    };

    // Register view capability in app1.
    const capability1 = await microfrontendNavigator.registerCapability('app1', capability);
    // Register the same view capability in app1 again.
    const capability2 = await microfrontendNavigator.registerCapability('app1', capability);
    // Expect ids to be stable.
    expect(capability1.metadata!.id).toEqual(capability2.metadata!.id);
  });

  test('should error if not having a qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {},
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    });
    await expect(capability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(capability).rejects.toThrow(/NullPathError/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<null>',
      },
    });
    await expect(capability).rejects.toThrow(/NullPathError/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<string></string>',
      },
    });
    expect(capability.properties.path).toEqual('');
  });
});
