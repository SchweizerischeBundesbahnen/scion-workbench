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

test.describe('Workbench RouterLink', () => {

  test('should open the view in the current view tab (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab without activating it when pressing the META modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink(['Meta']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
  });

  test('should open the view in a new view tab and activate it when pressing the CTRL modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(true);
    await routerPagePO.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab and activate it when pressing the META modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(true);
    await routerPagePO.clickNavigateViaRouterLink(['Meta']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should close view by path', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    const testView = appPO.view({cssClass: 'testee'});
    await expect(await testView.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView.viewTab.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isPresent()).toBe(true);
  });

  test('should close view by id', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    const testView = appPO.view({cssClass: 'testee'});
    await expect(await testView.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget(await testView.getViewId());
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView.viewTab.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isPresent()).toBe(true);
  });

  test('should close the current view without explicit target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // GIVEN
    const routerPagePO1 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPagePO2 = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerPagePO3 = await workbenchNavigator.openInNewTab(RouterPagePO);

    // WHEN
    await routerPagePO2.viewTabPO.click();
    await routerPagePO2.enterPath('<empty>');
    await routerPagePO2.checkClose(true);
    await routerPagePO2.clickNavigateViaRouterLink();

    // THEN
    await expect(await routerPagePO1.viewTabPO.isPresent()).toBe(true);
    await expect(await routerPagePO2.viewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO3.viewTabPO.isPresent()).toBe(true);
  });

  test('should close matching views', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    // Open test view 1 (but do not activate it)
    await routerPagePO.enterPath('/test-pages/navigation-test-page/1');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    // Open test view 2 (but do not activate it)
    await routerPagePO.enterPath('/test-pages/navigation-test-page/2');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    // Open test view 3 (but do not activate it)
    await routerPagePO.enterPath('/test-pages/navigation-test-page/3');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    const testView1 = appPO.view({cssClass: 'testee-1'});
    const testView2 = appPO.view({cssClass: 'testee-2'});
    const testView3 = appPO.view({cssClass: 'testee-3'});

    await expect(await testView1.viewTab.isPresent()).toBe(true);
    await expect(await testView2.viewTab.isPresent()).toBe(true);
    await expect(await testView3.viewTab.isPresent()).toBe(true);

    // WHEN
    await routerPagePO.enterPath('/test-pages/navigation-test-page/*');
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigateViaRouterLink();

    // THEN
    await expect(await testView1.viewTab.isPresent()).toBe(false);
    await expect(await testView2.viewTab.isPresent()).toBe(false);
    await expect(await testView3.viewTab.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isPresent()).toBe(true);
  });

  test('should navigate present view(s) if navigating outside a view and not setting a target', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    // WHEN
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.checkViewContext(false); // simulate navigating outside a view context
    await routerPagePO.clickNavigateViaRouterLink();

    // THEN
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
  });

  test('should replace the current view if navigating inside a view (and not activate a matching view)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // GIVEN
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.checkActivate(false);
    await routerPagePO.clickNavigate();

    // WHEN
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigateViaRouterLink();

    // THEN
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.getViewId()).toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
  });

  test('should not navigate current view if not the target of primary routes', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add router page to the peripheral grid as named view
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {relativeTo: 'main-area', align: 'left', ratio: .25});
    await layoutPagePO.addView('router', {partId: 'left', activateView: true});
    await layoutPagePO.registerRoute({path: '', component: 'router-page', outlet: 'router'}, {title: 'Workbench Router'});

    // Navigate in the router page via router link
    const routerPagePO = new RouterPagePO(appPO, 'router');
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('e2e-testee');
    await routerPagePO.clickNavigateViaRouterLink();

    // Expect the test view to be opened in the main area
    const testeeViewPO = appPO.view({cssClass: 'e2e-testee'});
    await expect(await testeeViewPO.isVisible()).toBe(true);
    await expect(await testeeViewPO.isInMainArea()).toBe(true);

    // Expect the router page to be still opened in the peripheral grid
    await expect(await routerPagePO.viewPO.part.getPartId()).toEqual('left');
    await expect(await routerPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.viewPO.isInMainArea()).toBe(false);
  });

  test('should navigate current view if the target of primary routes', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to peripheral grid
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {relativeTo: 'main-area', align: 'left', ratio: .25});

    // Add router page to the peripheral part as unnamed view
    {
      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('/test-router');
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('e2e-router');
      await routerPagePO.enterBlankPartId('left');
      await routerPagePO.clickNavigate();
      await routerPagePO.viewPO.viewTab.close();
    }

    // Navigate in the router page via router link
    const routerPagePO = new RouterPagePO(appPO, await appPO.view({cssClass: 'e2e-router'}).getViewId());
    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('e2e-testee');
    await routerPagePO.clickNavigateViaRouterLink();

    // Expect the test view to replace the router view
    const testeeViewPO = appPO.view({cssClass: 'e2e-testee'});
    await expect(await testeeViewPO.isVisible()).toBe(true);
    await expect(await testeeViewPO.isInMainArea()).toBe(false);
    await expect(await testeeViewPO.getViewId()).toEqual(routerPagePO.viewId);
    await expect(await routerPagePO.isVisible()).toBe(false);
  });
});
