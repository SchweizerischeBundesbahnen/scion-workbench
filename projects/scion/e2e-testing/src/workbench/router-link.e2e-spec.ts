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
import {LayoutPagePO} from './page-object/layout-page.po';
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench RouterLink', () => {

  test('should open the view in the current view tab (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(1);

    await expectView(routerPage).not.toBeAttached();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open the view in a new view tab (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open the view in a new view tab (target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink(['Control']);

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab without activating it when pressing the META modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink(['Meta']);

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();
  });

  test('should open the view in a new view tab and activate it when pressing the CTRL modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(true);
    await routerPage.clickNavigateViaRouterLink(['Control']);

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

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(true);
    await routerPage.clickNavigateViaRouterLink(['Meta']);

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should navigate present view(s) if navigating outside a view and not setting a target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // WHEN
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkViewContext(false); // simulate navigating outside a view context
    await routerPage.clickNavigateViaRouterLink();

    const testViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // THEN
    await expectView(routerPage).toBeInactive();
    await expectView(testViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should replace the current view if navigating inside a view (and not activate a matching view)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    // WHEN
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigateViaRouterLink();

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // THEN
    await expectView(testViewPage1).toBeInactive();
    await expectView(testViewPage2).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should not navigate current view if not the target of primary routes', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add router page to the workbench grid as named view
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});
    await layoutPage.addView('router', {partId: 'left', activateView: true});
    await layoutPage.registerRoute({path: '', component: 'router-page', outlet: 'router'}, {title: 'Workbench Router'});
    await layoutPage.view.tab.close();

    // Navigate in the router page via router link
    const routerPage = new RouterPagePO(appPO, {viewId: 'router'});
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect the test view to be opened in the main area
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views({inMainArea: true})).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.part.isInMainArea()).toBe(true);

    // Expect the router page to be still opened in the workbench grid
    await expectView(routerPage).toBeActive();
    await expect.poll(() => routerPage.view.part.getPartId()).toEqual('left');
    await expect.poll(() => routerPage.view.part.isInMainArea()).toBe(false);
    await expect(appPO.views({inMainArea: false})).toHaveCount(1);
  });

  test('should navigate current view if the target of primary routes', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to workbench grid
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});

    // Add router page to the part as unnamed view
    {
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('/test-router');
      await routerPage.enterTarget('view.101');
      await routerPage.enterCssClass('router');
      await routerPage.enterBlankPartId('left');
      await routerPage.clickNavigate();
      await routerPage.view.tab.close();
    }

    // Navigate in the router page via router link
    const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect the test view to replace the router view
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();
    await expectView(routerPage).not.toBeAttached();
    await expect.poll(() => testeeViewPage.view.part.getPartId()).toEqual('left');
    await expect.poll(() => testeeViewPage.view.part.isInMainArea()).toBe(false);
    await expect.poll(() => testeeViewPage.view.getViewId()).toEqual('view.101');
  });

  test('should open view in the current part (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register Angular routes.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerRoute({path: '', component: 'router-page', outlet: 'router'});
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'other'});
    await layoutPage.registerRoute({path: 'testee', component: 'view-page'});
    await layoutPage.view.tab.close();

    // Register new perspective.
    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'test',
      data: {
        label: 'test',
      },
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'router', partId: 'left', activateView: true},
        {id: 'other', partId: 'right', activateView: true},
      ],
    });
    await perspectivePage.view.tab.close();

    // Switch to the newly created perspective.
    await appPO.switchPerspective('test');

    // Expect layout to match the perspective definition.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'router'}], activeViewId: 'router'}),
          child2: new MPart({id: 'right', views: [{id: 'other'}], activeViewId: 'other'}),
        }),
      },
    });

    // Open new view via workbench router link.
    const routerPage = new RouterPagePO(appPO, {viewId: 'router'});
    await routerPage.enterPath('/testee');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect new view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();

    // Expect new view to be opened in active part of the contextual view i.e. left
    const testeeViewId = await testeeViewPage.view.getViewId();
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'router'}, {id: testeeViewId}], activeViewId: testeeViewId}),
          child2: new MPart({id: 'right', views: [{id: 'other'}], activeViewId: 'other'}),
        }),
      },
    });
  });
});
