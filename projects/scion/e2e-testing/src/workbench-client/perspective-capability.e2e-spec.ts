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
import {RegisterWorkbenchCapabilityPagePO, WorkbenchPerspectiveCapability} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench Perspective Capability', () => {

  test('should assign stable identifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capability: WorkbenchPerspectiveCapability = {
      type: 'perspective',
      qualifier: {name: 'testee-1'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            relativeTo: MAIN_AREA,
            align: 'left',
            ratio: 0.3,
          },
          {
            id: 'left-bottom',
            relativeTo: 'left',
            align: 'bottom',
            ratio: 0.5,
          },
        ],
      },
    };

    // Register perspective capability.
    const id1 = (await registerCapabilityPage1PO.registerCapability(capability)).metadata!.id;

    // Unregister perspective capability.
    const unregisterCapabilityPagePO = await microfrontendNavigator.openInNewTab(UnregisterWorkbenchCapabilityPagePO, 'app1');
    await unregisterCapabilityPagePO.unregisterCapability(id1);

    // Register perspective capability again.
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const id2 = (await registerCapabilityPage2PO.registerCapability(capability)).metadata!.id;

    // Expect ids to be stable.
    expect(id1).toEqual(id2);
  });

  test('should error if qualifier is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'perspective',
      qualifier: undefined!,
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
        ],
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifier is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'perspective',
      qualifier: {},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
        ],
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if id of parts is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPage1PO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: undefined!,
            align: 'left',
          },
        ],
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullPartIdError/);
  });
});
