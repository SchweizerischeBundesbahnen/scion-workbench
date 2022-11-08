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
import {RegisterWorkbenchCapabilityPagePO, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';

test.describe('Workbench View Capability', () => {

  test('should assign stable identifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capability: WorkbenchViewCapability = {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'microfrontend',
      },
    };

    // Register view capability in app1.
    const id1 = (await registerCapabilityPage1PO.registerCapability(capability)).metadata!.id;
    // Register the same view capability in app1 again.
    const id2 = (await registerCapabilityPage1PO.registerCapability(capability)).metadata!.id;
    // Expect ids to be stable.
    expect(id1).toEqual(id2);
  });

  test('should error if qualifier is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: undefined!,
      properties: {
        path: 'microfrontend',
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifier is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {},
      properties: {
        path: 'microfrontend',
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullPathError/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<null>',
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullPathError/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registeredCapability = await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<empty>',
      },
    });
    await expect(registeredCapability.properties!['path']).toEqual('');
  });
});
