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
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    };

    // Register view capability in app1.
    const capability1 = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', capability);
    // Register the same view capability in app1 again.
    const capability2 = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', capability);
    // Expect ids to be stable.
    expect(capability1.metadata!.id).toEqual(capability2.metadata!.id);
  });

  test('should error if not having a qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {},
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    });
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capability requires a qualifier/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capabilities require a path/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '<null>',
      },
    });
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capabilities require a path/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });
    expect(capability.properties.path).toEqual('');
  });

  test('should require empty path if host view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('non-empty path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'path/to/view',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[ViewDefinitionError] View capabilities of the host application require an empty path/);
    });

    await test.step('null path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '<null>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[ViewDefinitionError] View capabilities of the host application require an empty path/);
    });

    await test.step('undefined path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '<undefined>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[ViewDefinitionError] View capabilities of the host application require an empty path/);
    });

    await test.step('empty path', async () => {
      const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });
      expect(registeredCapability.properties.path).toEqual('');
    });
  });

  test('should not mark host views as "non-lazy" if "preloadInactiveMicrofrontendViews" compat mode is enabled', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true, preloadInactiveMicrofrontendViews: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Expect lazy property not to be set to `true`.
    expect(registeredCapability.properties.lazy).toBeUndefined();

    // Expect no warning to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Deprecation/})).toEqual(expect.not.arrayContaining([
      expect.stringContaining(`[Deprecation] Application 'workbench-host-app' provides a "non-lazy" view capability`),
    ]));
  });

  test('should error if host capability defines "lazy" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        lazy: true,
      },
    });
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] Property "lazy" not supported for view capabilities of the host application/);
  });

  test('should not error if capability defines "lazy" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        lazy: true,
      },
    });

    expect(registeredCapability.properties.lazy).toBe(true);
  });

  test('should error if host capability defines "showSplash" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        showSplash: true,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[ViewDefinitionError] Property "showSplash" not supported for view capabilities of the host application/);
  });

  test('should not error if capability defines "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        showSplash: true,
      },
    });

    expect(registeredCapability.properties.showSplash).toBe(true);
  });

  /**
   * TODO [Angular 22] Remove with Angular 22.
   */
  test('should log deprecation warning if using transient view parameter [transient=true]', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('Registering view capability with transient parameter', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        params: [
          {name: 'param', transient: true, required: false},
        ],
        properties: {
          path: 'path/to/view',
        },
      });
      expect(capability).toBeDefined();

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Deprecation/})).toEqual(expect.arrayContaining([
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });

    await test.step('Registering view capability with transient parameter [transient=false]', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        params: [
          {name: 'param', transient: false, required: false},
        ],
        properties: {
          path: 'path/to/view',
        },
      });
      expect(capability).toBeDefined();

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Deprecation/})).toEqual(expect.arrayContaining([
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });

    await test.step('Registering view capability without transient parameter', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        params: [
          {name: 'param', required: false},
        ],
        properties: {
          path: 'path/to/view',
        },
      });
      expect(capability).toBeDefined();

      // Expect no deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Deprecation/})).toEqual(expect.not.arrayContaining([
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });
  });
});
