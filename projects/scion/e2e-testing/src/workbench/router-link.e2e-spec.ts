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

test.describe('Workbench RouterLink', () => {

  test('should open the view in the current view tab (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigateViaRouterLink();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigateViaRouterLink();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
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

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab and activate it when pressing the CTRL modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(true);
    await routerPage.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
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

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
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

    const testView = appPO.view({cssClass: 'testee'});
    await expect(await testView.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPage.enterPath('/test-view');
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView.viewTab.isPresent()).toBe(false);
    await expect(await routerPage.viewTab.isPresent()).toBe(true);
  });

  test('should close view by id', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const testView = appPO.view({cssClass: 'testee'});
    await expect(await testView.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPage.enterPath('<empty>');
    await routerPage.enterTarget(await testView.getViewId());
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView.viewTab.isPresent()).toBe(false);
    await expect(await routerPage.viewTab.isPresent()).toBe(true);
  });

  test('should close the current view without explicit target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // GIVEN
    const routerPage1 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPage2 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPage3 = await workbenchNavigator.openInNewTab(RouterPagePO);

    // WHEN
    await routerPage2.viewTab.click();
    await routerPage2.enterPath('<empty>');
    await routerPage2.checkClose(true);
    await routerPage2.clickNavigateViaRouterLink();

    // THEN
    await expect(await routerPage1.viewTab.isPresent()).toBe(true);
    await expect(await routerPage2.viewTab.isPresent()).toBe(false);
    await expect(await routerPage3.viewTab.isPresent()).toBe(true);
  });

  test('should close matching views', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
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

    const testView1 = appPO.view({cssClass: 'testee-1'});
    const testView2 = appPO.view({cssClass: 'testee-2'});
    const testView3 = appPO.view({cssClass: 'testee-3'});

    await expect(await testView1.viewTab.isPresent()).toBe(true);
    await expect(await testView2.viewTab.isPresent()).toBe(true);
    await expect(await testView3.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPage.enterPath('/test-pages/navigation-test-page/*');
    await routerPage.checkClose(true);
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView1.viewTab.isPresent()).toBe(false);
    await expect(await testView2.viewTab.isPresent()).toBe(false);
    await expect(await testView3.viewTab.isPresent()).toBe(false);
    await expect(await routerPage.viewTab.isPresent()).toBe(true);
  });

  test('should navigate present view(s) if navigating outside a view and not setting a target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    // WHEN
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.checkViewContext(false); // simulate navigating outside a view context
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
  });

  test('should replace the current view if navigating inside a view (and not activate a matching view)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    // WHEN
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigateViaRouterLink();

    // THEN
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.getViewId()).toEqual(routerPage.viewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
  });

  test('should not navigate current view if not the target of primary routes', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add router page to the workbench grid as named view
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});
    await layoutPage.addView('router', {partId: 'left', activateView: true});
    await layoutPage.registerRoute({path: '', component: 'router-page', outlet: 'router'}, {title: 'Workbench Router'});

    // Navigate in the router page via router link
    const routerPage = new RouterPagePO(appPO, 'router');
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('e2e-testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect the test view to be opened in the main area
    const testeeView = appPO.view({cssClass: 'e2e-testee'});
    await expect(await testeeView.isVisible()).toBe(true);
    await expect(await testeeView.isInMainArea()).toBe(true);

    // Expect the router page to be still opened in the workbench grid
    await expect(await routerPage.view.part.getPartId()).toEqual('left');
    await expect(await routerPage.isVisible()).toBe(true);
    await expect(await routerPage.view.isInMainArea()).toBe(false);
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
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('e2e-router');
      await routerPage.enterBlankPartId('left');
      await routerPage.clickNavigate();
      await routerPage.view.viewTab.close();
    }

    // Navigate in the router page via router link
    const routerPage = new RouterPagePO(appPO, await appPO.view({cssClass: 'e2e-router'}).getViewId());
    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('e2e-testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect the test view to replace the router view
    const testeeView = appPO.view({cssClass: 'e2e-testee'});
    await expect(await testeeView.isVisible()).toBe(true);
    await expect(await testeeView.isInMainArea()).toBe(false);
    await expect(await testeeView.getViewId()).toEqual(routerPage.viewId);
    await expect(await routerPage.isVisible()).toBe(false);
  });

  test('should open view in the current part (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register Angular routes.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerRoute({path: '', component: 'router-page', outlet: 'router'});
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'other'});
    await layoutPage.registerRoute({path: 'testee', component: 'view-page'});
    await layoutPage.viewTab.close();

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
    await perspectivePage.viewTab.close();

    // Switch to the newly created perspective.
    await appPO.switchPerspective('test');

    // Expect layout to match the perspective definition.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
    const routerPage = new RouterPagePO(appPO, 'router');
    await routerPage.enterPath('/testee');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigateViaRouterLink();

    // Expect new view to be opened.
    const testee = appPO.view({cssClass: 'testee'});
    await expect(await testee.viewTab.isPresent()).toBe(true);
    const testeeViewId = await testee.getViewId();

    // Expect new view to be opened in active part of the contextual view i.e. left
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
