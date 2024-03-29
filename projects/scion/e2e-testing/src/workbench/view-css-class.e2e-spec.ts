/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {ViewPagePO} from './page-object/view-page.po';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';
import {LayoutPagePO} from './page-object/layout-page.po';

test.describe('Workbench View CSS Class', () => {

  test('should set CSS classes via view handle', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-test-view');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-test-view');

    await test.step('Updating CSS classes via view handle', async () => {
      await viewPage.enterCssClass('testee-1');

      // Expect CSS classes set via handle to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-1');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-1');
      // Expect CSS classes of the navigation to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
      // Expect CSS classes of the route to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-test-view');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-test-view');
    });

    await test.step('Updating CSS classes via view handle', async () => {
      // Update CSS classes via view handle.
      await viewPage.enterCssClass('testee-2');

      // Expect CSS classes previously set via handle not to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-1');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-1');
      // Expect CSS classes set via handle to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-2');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-2');
      // Expect CSS classes of the navigation to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
      // Expect CSS classes of the route to be set.
      await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-test-view');
      await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-test-view');
    });
  });

  test('should associate CSS classes with a navigation (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('right', {align: 'right'});
    await layoutPage.addView('view.100', {partId: 'right', activateView: true});

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Navigate to 'test-pages/navigation-test-page/1' passing CSS class 'testee-navigation-1'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation-1');
    await routerPage.clickNavigate();
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-1');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-2'.
    await routerPage.enterPath('test-pages/navigation-test-page/2');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation-2');
    await routerPage.clickNavigate();
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-2');
    // Expect CSS classes of the previous navigation not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-3'.
    await routerPage.enterPath('test-pages/navigation-test-page/2');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation-3');
    await routerPage.clickNavigate();
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-3');
    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/1' without passing CSS class.
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass([]);
    await routerPage.clickNavigate();
    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-3');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');
  });

  test('should retain navigational CSS classes when moving view in the layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'east'});

    // Expect CSS classes of the navigation to be retained.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
  });

  test('should retain navigational CSS classes when switching view tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.102');
    await routerPage.enterCssClass('testee-2');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Expect CSS classes of the navigation to be present when clicking view 1.
    await viewPage1.view.tab.click();
    await expect.poll(() => viewPage1.view.tab.getCssClasses()).toContain('testee-1');
    await expect.poll(() => viewPage2.view.tab.getCssClasses()).toContain('testee-2');

    // Expect CSS classes of the navigation to be present when clicking view 2.
    await viewPage2.view.tab.click();
    await expect.poll(() => viewPage1.view.tab.getCssClasses()).toContain('testee-1');
    await expect.poll(() => viewPage2.view.tab.getCssClasses()).toContain('testee-2');
  });

  test('should add CSS classes to inactive view (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterTarget('view.100');
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
  });
});
