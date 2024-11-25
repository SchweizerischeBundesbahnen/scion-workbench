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

test.describe('Workbench View CSS Class', () => {

  test('should set CSS classes via view handle', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      cssClass: 'testee-navigation',
    });

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

  test('should associate CSS classes with a view (WorkbenchLayout.addView) and navigation (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('view.100', {partId: 'right', activateView: true, cssClass: 'testee-layout'}),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Navigate to 'test-pages/navigation-test-page/1' passing CSS class 'testee-navigation-1'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.100',
      cssClass: 'testee-navigation-1',
    });

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-1');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-2'.
    await routerPage.navigate(['test-pages/navigation-test-page/2'], {
      target: 'view.100',
      cssClass: 'testee-navigation-2',
    });

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-2');
    // Expect CSS classes of the previous navigation not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-3'.
    await routerPage.navigate(['test-pages/navigation-test-page/2'], {
      target: 'view.100',
      cssClass: 'testee-navigation-3',
    });

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-3');
    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/1' without passing CSS class.
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.100',
    });

    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-3');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');
  });

  test('should associate CSS classes with a view (WorkbenchLayout.addView) and navigation (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('view.100', {partId: 'right', activateView: true, cssClass: 'testee-layout'}),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Navigate to 'test-pages/navigation-test-page/1' passing CSS class 'testee-navigation-1'.
    await workbenchNavigator.modifyLayout(layout => layout.navigateView('view.100', ['test-pages/navigation-test-page/1'], {cssClass: 'testee-navigation-1'}));
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-1');
    // Expect CSS class(es) of the view to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS class(es) of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-2'.
    await workbenchNavigator.modifyLayout(layout => layout.navigateView('view.100', ['test-pages/navigation-test-page/2'], {cssClass: 'testee-navigation-2'}));
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-2');
    // Expect CSS classes of the previous navigation not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/2' passing CSS class 'testee-navigation-3'.
    await workbenchNavigator.modifyLayout(layout => layout.navigateView('view.100', ['test-pages/navigation-test-page/2'], {cssClass: 'testee-navigation-3'}));
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-3');
    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');

    // Navigate to 'test-pages/navigation-test-page/1' without passing CSS class.
    await workbenchNavigator.modifyLayout(layout => layout.navigateView('view.100', ['test-pages/navigation-test-page/1']));
    // Expect CSS classes of the previous navigations not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-3');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-3');
    // Expect CSS classes of the layout to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the route to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('e2e-navigation-test-page');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('e2e-navigation-test-page');
  });

  test('should retain navigational CSS classes when moving view in the layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      cssClass: 'testee-navigation',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    const dragHandle = await viewPage.view.tab.startDrag();
    await dragHandle.dragToPart(await viewPage.view.part.getPartId(), {region: 'east'});
    await dragHandle.drop();

    // Expect CSS classes of the navigation to be retained.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
  });

  test('should retain navigational CSS classes when moving view to new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      cssClass: 'testee-navigation',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Move view to new window.
    const newAppPO = await viewPage.view.tab.moveToNewWindow();
    const newViewPage = new ViewPagePO(newAppPO, {viewId: 'view.1'});

    // Expect CSS classes of the navigation to be retained
    await expect.poll(() => newViewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => newViewPage.view.tab.getCssClasses()).toContain('testee-navigation');
  });

  test('should retain navigational CSS classes when moving view to other window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      activate: false,
      cssClass: 'testee-navigation-1',
    });

    // Open view 2
    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      activate: false,
      cssClass: 'testee-navigation-2',
    });

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Move view 1 to new window.
    const newAppPO = await viewPage1.view.tab.moveToNewWindow();
    const newViewPage1 = new ViewPagePO(newAppPO, {viewId: 'view.1'});

    // Move view 2 to the window.
    await viewPage2.view.tab.moveTo(await newViewPage1.view.part.getPartId(), {workbenchId: await newAppPO.getWorkbenchId()});
    const newViewPage2 = new ViewPagePO(newAppPO, {viewId: 'view.2'});

    // Expect CSS classes of the navigation to be retained
    await expect.poll(() => newViewPage2.view.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => newViewPage2.view.tab.getCssClasses()).toContain('testee-navigation-2');
  });

  test('should retain navigational CSS classes when reloading the application', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      cssClass: 'testee-navigation',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');

    // Reload the application.
    await appPO.reload();

    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation');
  });

  test('should retain navigational CSS classes when switching view tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      activate: false,
      cssClass: 'testee-1',
    });

    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      activate: false,
      cssClass: 'testee-2',
    });

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
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      activate: false,
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
  });

  test('should add CSS classes to inactive view (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId, activateView: false})
      .navigateView('view.100', ['test-view'], {cssClass: 'testee'}),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
  });
});
