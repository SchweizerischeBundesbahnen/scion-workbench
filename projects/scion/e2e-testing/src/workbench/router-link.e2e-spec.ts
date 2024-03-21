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
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {NavigationTestPagePO} from './page-object/test-pages/navigation-test-page.po';

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

  test('should close view by path', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();

    // WHEN
    await routerPage.enterPath('/test-view');
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should close view by id', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPage.enterPath('/test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).toBeInactive();

    // WHEN
    await routerPage.enterPath('');
    await routerPage.enterTarget('view.101');
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should close the current view without explicit target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // GIVEN
    const routerPage1 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPage2 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPage3 = await workbenchNavigator.openInNewTab(RouterPagePO);

    // WHEN
    await routerPage2.view.tab.click();
    await routerPage2.enterPath('');
    await routerPage2.checkClose(true);
    await routerPage2.clickNavigateViaRouterLink();

    // THEN
    await expectView(routerPage1).toBeInactive();
    await expectView(routerPage2).not.toBeAttached();
    await expectView(routerPage3).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should close matching views', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // GIVEN
    // Open test view 1 (but do not activate it)
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('/test-pages/navigation-test-page/1');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    // Open test view 2 (but do not activate it)
    await routerPage.enterPath('/test-pages/navigation-test-page/2');
    await routerPage.enterCssClass('testee-2');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    // Open test view 3 (but do not activate it)
    await routerPage.enterPath('/test-pages/navigation-test-page/3');
    await routerPage.enterCssClass('testee-3');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const testViewPage1 = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testViewPage3 = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});

    await expectView(routerPage).toBeActive();
    await expectView(testViewPage1).toBeInactive();
    await expectView(testViewPage2).toBeInactive();
    await expectView(testViewPage3).toBeInactive();

    // WHEN
    await routerPage.enterPath('/test-pages/navigation-test-page/*');
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expectView(routerPage).toBeActive();
    await expectView(testViewPage1).not.toBeAttached();
    await expectView(testViewPage2).not.toBeAttached();
    await expectView(testViewPage3).not.toBeAttached();
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

  test('should navigate current view when navigating from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to path-based route via router link.
    const pathBasedRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await pathBasedRouterPage.enterPath('/test-view');
    await pathBasedRouterPage.enterCssClass('testee');
    await pathBasedRouterPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should navigate current view when navigating from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to empty-path route via router link.
    const pathBasedRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await pathBasedRouterPage.enterPath('');
    await pathBasedRouterPage.enterOutlet('test-view');
    await pathBasedRouterPage.enterCssClass('testee');
    await pathBasedRouterPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should navigate current view when navigating from empty-path route route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterCssClass('test-router');
    await routerPage.enterOutlet('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to empty-path route via router link.
    const emptyPathRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await emptyPathRouterPage.enterPath('');
    await emptyPathRouterPage.enterOutlet('test-view');
    await emptyPathRouterPage.enterCssClass('testee');
    await emptyPathRouterPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should navigate current view when navigating from empty-path route route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterCssClass('test-router');
    await routerPage.enterOutlet('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to path-based route via router link.
    const emptyPathRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await emptyPathRouterPage.enterPath('test-view');
    await emptyPathRouterPage.enterCssClass('testee');
    await emptyPathRouterPage.clickNavigateViaRouterLink();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should open view in the current part (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register new perspective.
    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      data: {
        label: 'testee',
      },
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'router', partId: 'left', activateView: true},
        {id: 'test-view', partId: 'right', activateView: true},
      ],
      navigateViews: [
        {id: 'router', commands: ['test-router']},
        {id: 'test-view', commands: ['test-view']},
      ],
    });
    await perspectivePage.view.tab.close();

    // Switch to the newly created perspective.
    await appPO.switchPerspective('testee');

    // Expect layout to match the perspective definition.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
        }),
      },
    });

    // Open new view via workbench router link.
    const routerPage = new RouterPagePO(appPO, {viewId: await appPO.resolveViewId('router')});
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect new view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();

    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
        }),
      },
    });
  });
});
