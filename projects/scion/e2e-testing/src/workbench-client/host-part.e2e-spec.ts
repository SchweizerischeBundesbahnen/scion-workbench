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
import {canMatchWorkbenchPartCapability} from '../workbench/page-object/layout-page/register-route-page.po';
import {expect} from '@playwright/test';
import {expectPart as expectWorkbenchPart} from '../matcher/part-matcher';
import {PartPagePO, PartPagePO as WorkbenchPartPagePO} from '../workbench/page-object/part-page.po';

test.describe('Workbench Host Part', () => {

  test('should open a part contributed by the host app', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      properties: {
        path: '',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.host',
            qualifier: {part: 'testee', app: 'host'},
          },
        ],
      },
    });

    const part = appPO.part({partId: 'part.host'});

    // Expect host part to display.
    await expectWorkbenchPart(part).toDisplayComponent(WorkbenchPartPagePO.selector);
  });

  test('should pass capability to the part component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      properties: {
        path: '',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.host',
            qualifier: {part: 'testee', app: 'host'},
          },
        ],
      },
    });

    const part = appPO.part({partId: 'part.host'});
    const partPage = new PartPagePO(part);

    // Expect capability.
    await expect.poll(() => partPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {part: 'testee', app: 'host'},
      properties: {
        path: '',
      },
    });
  });

  test('should pass params to the part component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.host',
            qualifier: {part: 'testee', app: 'host'},
            params: {
              param: '123',
            },
          },
        ],
      },
    });

    const part = appPO.part({partId: 'part.host'});
    const partPage = new PartPagePO(part);

    // Expect params.
    await expect.poll(() => partPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

  test('should pass referrer to the part component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intention.
    await microfrontendNavigator.registerIntention('app1', {type: 'part', qualifier: {part: 'testee', app: 'host'}});

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      private: false,
      properties: {
        path: '',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.host',
            qualifier: {part: 'testee', app: 'host'},
          },
        ],
      },
    });

    const part = appPO.part({partId: 'part.host'});
    const partPage = new PartPagePO(part);

    // Expect referrer.
    await expect.poll(() => partPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
  });
});
