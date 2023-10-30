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

test.describe('Workbench Perspective Extension Capability', () => {

  test('should register perspective extension capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {component: 'view'},
            partId: 'left',
            active: true,
            position: 1,
          },
          {
            qualifier: {component: 'view-1'},
            partId: 'bottom',
            active: true,
            position: 1,
          },
          {
            qualifier: {component: 'view-2'},
            partId: 'bottom',
            active: false,
            position: 2,
          },
        ],
      },
    });
    await expect(registerCapability).resolves.not.toThrow();
  });

  test('should error if qualifer of perspective to extend is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: undefined!,
        views: [],
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifer of perspective to extend is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {},
        views: [],
      },
    });
    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifer of views is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: undefined!,
            partId: 'left',
          },
        ],
      },
    });

    await expect(registerCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if partId of views is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const registerCapability = registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {component: 'view'},
            partId: undefined!,
          },
        ],
      },
    });

    await expect(registerCapability).rejects.toThrow(/NullPartIdError/);
  });
});
