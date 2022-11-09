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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';

test.describe('Workbench Popup Capability', () => {

  test('should error if qualifier is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: undefined!,
      properties: {
        path: 'microfrontend',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifier is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {},
      properties: {
        path: 'microfrontend',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<null>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<empty>',
      },
    });
    await expect(registeredCapability.properties!['path']).toEqual('');
  });
});
