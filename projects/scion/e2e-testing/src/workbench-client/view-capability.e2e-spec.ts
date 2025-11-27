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
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capability requires a qualifier/);
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
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capability requires the 'path' property/);
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
    await expect(capability).rejects.toThrow(/\[ViewDefinitionError] View capability requires the 'path' property/);
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

  /**
   * TODO [Angular 22] Remove with Angular 22.
   */
  test('should log deprecation warning if using transient view parameter [transient=true]', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('Registering view capability with transient parameter', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
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
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee-1' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });

    await test.step('Registering view capability with transient parameter [transient=false]', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
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
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee-1' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });

    await test.step('Registering view capability without transient parameter', async () => {
      consoleLogs.clear();
      const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
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
        expect.stringContaining(`[Deprecation][workbench-client-testing-app1] Transient view parameter 'param' in view capability 'component=testee-1' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`),
      ]));
    });
  });
});
