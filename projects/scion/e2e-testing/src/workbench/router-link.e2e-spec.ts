/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {ViewInfo} from './page-object/view-info-dialog.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench RouterLink', () => {

  test('should open the view in the current view tab (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(1);

    await expectView(routerPage).not.toBeAttached();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open view in current tab (view is in peripheral area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true}),
    );

    // Add state via separate navigation as not supported when adding views to the perspective.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateView('view.101', ['test-router'], {state: {navigated: 'false'}}),
    );

    // Open test view via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await routerPage.navigateViaRouterLink(['/test-view'], {
      state: {navigated: 'true'},
    });

    // Expect router page to be replaced
    await expect.poll(() => routerPage.view.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        urlSegments: 'test-view',
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  test('should open the view in a new view tab (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'auto',
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open the view in a new view tab (target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'blank',
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      cssClass: 'testee',
      modifiers: ['Control'],
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // Navigate via router link while pressing CTRL Modifier key.
    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'auto',
      cssClass: 'testee-1',
      modifiers: ['Control'],
    });

    const testeeViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage1).toBeInactive();

    // Navigate via router link again while pressing CTRL Modifier key.
    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'auto',
      cssClass: 'testee-2',
      modifiers: ['Control'],
    });

    const testeeViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage1).toBeInactive();
    await expectView(testeeViewPage2).toBeInactive();
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab without activating it when pressing the META modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      cssClass: 'testee',
      modifiers: ['Meta'],
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();
  });

  test('should open the view in a new view tab and activate it when pressing the CTRL modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      activate: true,
      cssClass: 'testee',
      modifiers: ['Control'],
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab and activate it when pressing the META modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigateViaRouterLink(['/test-view'], {
      activate: true,
      cssClass: 'testee',
      modifiers: ['Meta'],
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should navigate present view(s) if navigating outside a view and not setting a target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // WHEN
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigateViaRouterLink(['/test-view'], {
      viewContextActive: false, // simulate navigating outside a view context
      cssClass: 'testee',
    });

    const testViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // THEN
    await expectView(routerPage).toBeInactive();
    await expectView(testViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should replace the current view if navigating inside a view (and not activate a matching view)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['/test-view'], {
      activate: false,
      cssClass: 'testee-1',
    });

    // WHEN
    await routerPage.navigateViaRouterLink(['/test-view'], {
      cssClass: 'testee-2',
    });

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // THEN
    await expectView(testViewPage1).toBeInactive();
    await expectView(testViewPage2).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should navigate current view when navigating from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', ['test-router']),
    );

    // Navigate to path-based route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink(['/test-view']);

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate current view when navigating from path-based route to empty-path route (1/2)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', ['test-router']),
    );

    // Navigate to empty-path route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink([], {
      state: {navigated: 'true'},
    });

    const testeeViewPage = new RouterPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-router', navigationHint: ''},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate current view when navigating from path-based route to empty-path route (2/2)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', ['test-router']),
    );

    // Navigate to empty-path route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink(['/'], {hint: 'test-view'});

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate current view when navigating from empty-path route to empty-path route (1/2)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', [], {hint: 'test-router'}),
    );

    // Navigate to empty-path route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink([], {hint: 'test-view'});

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate current view when navigating from empty-path route to empty-path route (2/2)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', [], {hint: 'test-router'}),
    );

    // Navigate to empty-path route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink(['/'], {hint: 'test-view'});

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate current view when navigating from empty-path route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', [], {hint: 'test-router'}),
    );

    // Navigate to path-based route via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigateViaRouterLink(['test-view']);

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should update matrix parameters of current view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigateViaRouterLink([{a: 'b', c: 'd'}]);

    await expectView(routerPage).toBeActive();
    await expect.poll(() => routerPage.view.getInfo()).toMatchObject(
      {
        routeParams: {a: 'b', c: 'd'},
        routeData: {path: 'test-router', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should open view in the current part (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('left')
      .addPart('right', {align: 'right'})
      .addView('view.101', {partId: 'left', activateView: true})
      .addView('view.102', {partId: 'right', activateView: true}),
    );
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateView('view.101', ['test-router'], {state: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {state: {navigated: 'false'}}),
    );

    const view1 = appPO.view({viewId: 'view.101'});
    const view2 = appPO.view({viewId: 'view.102'});

    // Open test view via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await routerPage.navigateViaRouterLink(['/test-view'], {
      state: {navigated: 'true'},
    });

    // Expect test view to replace the router page
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect test view not to replace test view on the right.
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );

    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: 'right', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
        }),
      },
    });
  });

  test('should open view in main area (view is in peripheral area, target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true}),
    );

    // Add state via separate navigation as not supported when adding views to the perspective.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateView('view.101', ['test-router'], {state: {navigated: 'false'}}),
    );

    const testView = appPO.view({viewId: 'view.1'});

    // Open test view via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'blank',
      state: {navigated: 'true'},
    });

    // Expect test view to be opened
    await expect.poll(() => testView.getInfo()).toMatchObject(
      {
        viewId: 'view.1',
        urlSegments: 'test-view',
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect router page not to be replaced
    await expect.poll(() => routerPage.view.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        urlSegments: 'test-router',
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );

    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
  });

  test('should open view in main area (view is in peripheral area, target=viewId)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true}),
    );

    // Add state via separate navigation as not supported when adding views to the perspective.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateView('view.101', ['test-router'], {state: {navigated: 'false'}}),
    );

    const testView = appPO.view({viewId: 'view.102'});

    // Open test view via router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await routerPage.navigateViaRouterLink(['/test-view'], {
      target: 'view.102',
      state: {navigated: true},
    });

    // Expect test view to be opened
    await expect.poll(() => testView.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        urlSegments: 'test-view',
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect router page not to be replaced
    await expect.poll(() => routerPage.view.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        urlSegments: 'test-router',
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );

    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.102'}],
          activeViewId: 'view.102',
        }),
      },
    });
  });
});
