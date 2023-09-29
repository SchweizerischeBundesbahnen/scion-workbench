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
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench View', () => {

  test('should allow updating the view tab title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPage.enterTitle('TITLE');
    await expect(await viewPage.viewTab.getTitle()).toEqual('TITLE');

    await viewPage.enterTitle('title');
    await expect(await viewPage.viewTab.getTitle()).toEqual('title');
  });

  test('should allow updating the view tab heading', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPage.enterHeading('HEADING');
    await expect(await viewPage.viewTab.getHeading()).toEqual('HEADING');

    await viewPage.enterHeading('heading');
    await expect(await viewPage.viewTab.getHeading()).toEqual('heading');
  });

  test('should not display the view tab heading (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.viewTab.heading).not.toBeVisible();
  });

  test('should not display the view tab heading if the tab height < 3.5rem', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.4rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.viewTab.heading).not.toBeVisible();
  });

  test('should display the view tab heading if the tab height >= 3.5rem', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.viewTab.heading).toBeVisible();
    await expect(await viewPage.viewTab.getHeading()).toEqual('heading');
  });

  test('should allow to mark the view dirty', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect(await viewPage.viewTab.isDirty()).toBe(false);

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect(await viewPage.viewTab.isDirty()).toBe(true);

    // Mark the view pristine
    await viewPage.checkDirty(false);
    await expect(await viewPage.viewTab.isDirty()).toBe(false);
  });

  test('should unset the dirty state when navigating to a different route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.viewTab;
    const viewId = await viewTab.getViewId();

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect(await viewTab.isDirty()).toBe(true);

    // Navigate to a different route in the same view
    await routerPage.viewTab.click();
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // Expect the view to be pristine
    await expect(await viewTab.isDirty()).toBe(false);
  });

  test('should not unset the dirty state when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.viewTab;
    const viewId = await viewTab.getViewId();

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect(await viewTab.isDirty()).toBe(true);

    // Update matrix params (does not affect routing)
    await routerPage.viewTab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(viewId);
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the view to still be dirty
    await expect(await viewTab.isDirty()).toBe(true);

    // Verify matrix params have changed
    await viewTab.click();
    await expect(await viewPage.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the title when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.viewTab;
    const viewId = await viewTab.getViewId();

    // Set the title
    await viewPage.enterTitle('TITLE');
    await expect(await viewTab.getTitle()).toEqual('TITLE');

    // Update matrix params (does not affect routing)
    await routerPage.viewTab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(viewId);
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the title has not changed
    await expect(await viewTab.getTitle()).toEqual('TITLE');
    // Verify matrix params have changed
    await viewTab.click();
    await expect(await viewPage.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the heading when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.viewTab;
    const viewId = await viewTab.getViewId();

    // Set the heading
    await viewPage.enterHeading('HEADING');
    await expect(await viewTab.getHeading()).toEqual('HEADING');

    // Update matrix params (does not affect routing)
    await routerPage.viewTab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(viewId);
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the heading has not changed
    await expect(await viewTab.getHeading()).toEqual('HEADING');

    // Verify matrix params have changed
    await viewTab.click();
    await expect(await viewPage.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should remove the closing handle from the view tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect(viewPage.viewTab.closeButton).toBeVisible();

    // Prevent the view from being closed
    await viewPage.checkClosable(false);
    await expect(viewPage.viewTab.closeButton).not.toBeVisible();

    // Mark the view closable
    await viewPage.checkClosable(true);
    await expect(viewPage.viewTab.closeButton).toBeVisible();
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to testee-1 view
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ComponentInstanceId = await testee1ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // navigate to testee-2 view
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ComponentInstanceId = await testee2ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewPage.viewTab.click();
    await testee1ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // activate testee-2 view
    await testee2ViewPage.viewTab.click();
    await testee2ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // navigate to testee-3 view
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee3ComponentInstanceId = await testee3ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewPage.viewTab.click();
    await testee1ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
  });

  test('should allow to close the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await viewPage.viewTab.isPresent()).toBe(true);
    await expect(await viewPage.view.isPresent()).toBe(true);

    await viewPage.clickClose();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);
    await expect(await viewPage.viewTab.isPresent()).toBe(false);
    await expect(await viewPage.view.isPresent()).toBe(false);
  });

  test(`should disable context menu 'Close tab' for 'non-closable' view`, async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    const contextMenu1 = await viewPage.view.viewTab.openContextMenu();
    // Expect menu item to be enabled.
    await expect(contextMenu1.menuItems.closeTab.locator).not.toBeDisabled();

    await viewPage.checkClosable(false);
    const contextMenu2 = await viewPage.view.viewTab.openContextMenu();
    // Expect menu item to be disabled.
    await expect(contextMenu2.menuItems.closeTab.locator).toBeDisabled();
  });

  test(`should not close 'non-closable' views via context menu 'Close all tabs'`, async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test view 2.
    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage2.checkClosable(false);

    // Open test view 3.
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // Close all views via context menu
    const contextMenu = await viewPage1.viewTab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    await expect(await appPO.viewIds()).toEqual([viewPage2.viewId]);
  });

  test('should detach view if not active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open two views.
    const view1Page = await workbenchNavigator.openInNewTab(ViewPagePO);
    const view2Page = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Expect view 2 to be visible.
    await expect(view1Page.locator).not.toBeAttached();
    await expect(view2Page.locator).toBeVisible();

    // Activate view 1.
    await view1Page.viewTab.click();

    // Expect view 1 to be visible.
    await expect(view1Page.locator).toBeVisible();
    await expect(view2Page.locator).not.toBeAttached();
  });

  test('should detach view if opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open two views in main area.
    const view1Page = await workbenchNavigator.openInNewTab(ViewPagePO);
    const view2Page = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 1 into peripheral area.
    await view1Page.viewTab.dragTo({grid: 'workbench', region: 'east'});
    await expect(view1Page.locator).toBeVisible();
    await expect(view2Page.locator).toBeVisible();

    // Maximize the main area.
    await view2Page.viewTab.dblclick();
    await expect(view1Page.locator).not.toBeAttached();
    await expect(view2Page.locator).toBeVisible();

    // Restore the layout.
    await view2Page.viewTab.dblclick();
    await expect(view1Page.locator).toBeVisible();
    await expect(view2Page.locator).toBeVisible();
  });
});
