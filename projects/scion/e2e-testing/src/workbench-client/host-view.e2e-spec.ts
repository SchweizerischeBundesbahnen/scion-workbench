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
import {RouterPagePO} from './page-object/router-page.po';
import {expectView} from '../matcher/view-matcher';
import {WorkbenchPartCapability, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {canMatchWorkbenchViewCapability} from '../workbench/page-object/layout-page/register-route-page.po';
import {expect} from '@playwright/test';
import {ViewPagePO} from '../workbench/page-object/view-page.po';

test.describe('Workbench Host View', () => {

  test('should open a view contributed by the host app', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

    // Expect host view to display.
    await expectView(new ViewPagePO(appPO.view({viewId: 'view.1'}))).toBeActive();
  });

  test('should pass capability to the view component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'view', app: 'host'}, {target: 'view.1'});

    const view = appPO.view({viewId: 'view.1'});
    const viewPage = new ViewPagePO(view);

    // Expect capability.
    await expect.poll(() => viewPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'view', app: 'host'},
      properties: {
        path: '',
      },
    });
  });

  test('should pass params to the view component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: true},
        {name: 'param2', required: false},
      ],
      properties: {
        path: '',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'}, {params: {param1: '123', param2: 'A'}, target: 'view.1'});

    // Expect microfrontend to display.
    const view = appPO.view({viewId: 'view.1'});
    const viewPage = new ViewPagePO(view);
    const componentInstanceId = await viewPage.getComponentInstanceId();

    // Expect params.
    await expect.poll(() => viewPage.activatedMicrofrontend.getParams()).toEqual({param1: '123', param2: 'A'});

    // Navigate view with other parameters.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {params: {param1: '123', param2: 'B'}});

    // Expect params.
    await expect.poll(() => viewPage.activatedMicrofrontend.getParams()).toEqual({param1: '123', param2: 'B'});

    // Expect the component not to be constructed anew.
    await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should pass referrer to the view component (opened via router)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intentions.
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'view', app: 'host'}});
    await microfrontendNavigator.registerIntention('app2', {type: 'view', qualifier: {component: 'view', app: 'host'}});

    // Open the view from app1.
    const routerPageApp1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPageApp1.navigate({component: 'view', app: 'host'}, {target: 'view.1'});

    const view = appPO.view({viewId: 'view.1'});
    const viewPage = new ViewPagePO(view);

    // Expect referrer to be app1.
    await expect.poll(() => viewPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');

    // Navigate view from app2.
    const routerPageApp2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPageApp2.navigate({component: 'view', app: 'host'}, {target: 'view.1'});

    // Expect referrer to be app2.
    await expect.poll(() => viewPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app2');
  });

  test('should pass referrer to the view component (added via perspective)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intention.
    await microfrontendNavigator.registerIntention('host', {type: 'part', qualifier: {component: 'part', app: 'app1'}});
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'view', app: 'host'}});

    // Register part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {component: 'part', app: 'app1'},
      private: false,
      properties: {
        views: [
          {qualifier: {component: 'view', app: 'host'}, cssClass: 'testee'},
        ],
      },
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.main',
            qualifier: {component: 'part', app: 'app1'},
          },
        ],
      },
    });

    const view = appPO.view({cssClass: 'testee'});
    const viewPage = new ViewPagePO(view);

    // Expect referrer.
    await expect.poll(() => viewPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
  });

  test('should navigate host view to other host view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee-1'})],
      data: {view: 'testee-1'},
    });

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: '',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee-2'})],
      data: {view: 'testee-2'},
    });

    // Open host view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee-1'}, {target: 'view.1'});

    const view = appPO.view({viewId: 'view.1'});
    const viewPage = new ViewPagePO(view);

    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.getRouteData()).toMatchObject({view: 'testee-1'});
    await expect.poll(() => viewPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'testee-1'},
      properties: {path: ''},
    });
    const componentInstanceId = await viewPage.getComponentInstanceId();

    // Navigate view to other host capability.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {target: 'view.1'});

    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.getRouteData()).toMatchObject({view: 'testee-2'});
    await expect.poll(() => viewPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'testee-2'},
      properties: {path: ''},
    });
    await expect.poll(() => viewPage.getComponentInstanceId()).not.toEqual(componentInstanceId);
  });

  test('should set configured `closable`', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('default', async () => {
      // Register view capability.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
          closable: undefined,
        },
      });

      // Register route for view capability.
      await workbenchNavigator.registerRoute({
        path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
      });

      // Open view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

      // Expect view to be closable.
      await expect(appPO.view({viewId: 'view.1'}).tab.closeButton).toBeVisible();
    });

    await test.step('closable', async () => {
      // Register view capability.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
          closable: true,
        },
      });

      // Register route for view capability.
      await workbenchNavigator.registerRoute({
        path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
      });

      // Open view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {target: 'view.2'});

      // Expect view to be closable.
      await expect(appPO.view({viewId: 'view.2'}).tab.closeButton).toBeVisible();
    });

    await test.step('non-closable', async () => {
      // Register view capability.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
          closable: false,
        },
      });

      // Register route for view capability.
      await workbenchNavigator.registerRoute({
        path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
      });

      // Open view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {target: 'view.3'});

      // Expect view to be closable.
      await expect(appPO.view({viewId: 'view.3'}).tab.closeButton).not.toBeAttached();
    });
  });

  test('should set configured CSS classes', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        cssClass: ['a', 'b'],
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

    // Expect CSS classes to be present.
    const view = appPO.view({viewId: 'view.1'});
    await expect(view.locator).toContainClass('a b');
  });

  test('should set configured title', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        title: 'Title',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

    // Expect CSS classes to be present.
    const view = appPO.view({viewId: 'view.1'});
    await expect(view.tab.title).toHaveText('Title');
  });

  test('should set configured heading', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        heading: 'Heading',
      },
    });

    // Register route for view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

    // Expect CSS classes to be present.
    const view = appPO.view({viewId: 'view.1'});
    await expect(view.tab.heading).toHaveText('Heading');
  });

  test('should unset state when navigating to another host microfrontend', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, designTokens: {'--sci-workbench-tab-height': '3.5rem'}});

    // Register view capability 1.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '',
        cssClass: 'testee-1',
      },
    });

    // Register route for view capability 1.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee-1'})],
    });

    // Register view capability 2.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: '',
      },
    });

    // Register route for view capability 2.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee-2'})],
    });

    // Navigate to view capability 1.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee-1'}, {target: 'view.1'});

    const view = appPO.view({viewId: 'view.1'});
    const viewPage = new ViewPagePO(view);

    // Change view state.
    await viewPage.enterTitle('Title 1');
    await viewPage.enterHeading('Heading 1');
    await viewPage.markDirty(true);

    await expect(view.tab.title).toHaveText('Title 1');
    await expect(view.tab.heading).toHaveText('Heading 1');
    await expect(view.tab.dirty).toBeVisible();

    // Navigate to view capability 2.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {target: 'view.1'});

    // Expect state to be unset.
    await expect(view.tab.title).toHaveText('');
    await expect(view.tab.heading).not.toBeAttached();
    await expect(view.tab.dirty).not.toBeAttached();
    await expect(view.locator).not.toContainClass('testee-1');
  });
});
