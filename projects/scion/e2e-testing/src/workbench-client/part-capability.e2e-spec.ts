/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {WorkbenchPartCapability} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';

test.describe('Workbench Part Capability', () => {

  test('should assign stable identifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability: WorkbenchPartCapability = {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'path/to/part',
      },
    };

    // Register part capability in app1.
    const capability1 = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', capability);
    // Register the same part capability in app1 again.
    const capability2 = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', capability);
    // Expect ids to be stable.
    expect(capability1.metadata!.id).toEqual(capability2.metadata!.id);
  });

  test('should error if not having a qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {},
      properties: {
        path: 'path/to/part',
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Part capability requires a qualifier/);
  });

  test('should not error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    expect(capability.properties?.path).toBeUndefined();
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: '<null>',
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Part capabilities require a path/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: '',
      },
    });
    expect(capability.properties!.path).toEqual('');
  });

  test('should require empty or no path if host part capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('non-empty path', async () => {
      const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'path/to/part',
        },
      });

      await expect(capability).rejects.toThrow(/\[PartDefinitionError] Part capabilities of the host application require an empty path/);
    });

    await test.step('null path', async () => {
      const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '<null>',
        },
      });

      await expect(capability).rejects.toThrow(/\[PartDefinitionError] Part capabilities of the host application require an empty path/);
    });

    await test.step('undefined path', async () => {
      const capability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '<undefined>',
        },
      });

      expect(capability.properties?.path).toBeUndefined();
    });

    await test.step('empty path', async () => {
      const capability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '',
        },
      });
      expect(capability.properties!.path).toEqual('');
    });
  });

  test('should error if part capability has extras but missing icon property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        extras: {
          label: 'testee',
          icon: '<undefined>',
        },
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Missing required 'icon' property in docked part extras /);
  });

  test('should error if part capability has extras but missing label property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        extras: {
          label: '<undefined>',
          icon: 'icon',
        },
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Missing required 'label' property in docked part extras /);
  });

  test('should error if views of part capability have no qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        views: [
          {
            qualifier: {},
          },
        ],
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Missing required qualifier for view/);
  });

  test('should error if views of part capability contain wildcards in qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        views: [
          {
            qualifier: {view: '*'},
          },
        ],
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] View qualifier must be explicit and not contain wildcards/);
  });

  test('should error if host capability defines "showSplash" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        showSplash: true,
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Property "showSplash" not supported for part capabilities of the host application/);
  });

  test('should not error if capability defines "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/part',
        showSplash: true,
      },
    });

    expect(capability.properties!.showSplash).toBe(true);
  });

  test('should error if capability defines "showSplash" property but not a path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {component: 'testee'},
      properties: {
        showSplash: true,
      },
    });
    await expect(capability).rejects.toThrow(/\[PartDefinitionError] Property "showSplash" only supported for part capabilities with a path/);
  });
});
