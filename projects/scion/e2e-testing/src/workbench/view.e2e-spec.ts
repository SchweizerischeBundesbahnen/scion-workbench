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
import {expectView} from '../matcher/view-matcher';

test.describe('Workbench View', () => {

  test('should provide the view\'s identity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.enterPath('/test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    await expect(viewPage.viewId).toHaveText('view.99');
  });

  test('should allow updating the view tab title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPage.enterTitle('TITLE');
    await expect(viewPage.view.tab.title).toHaveText('TITLE');

    await viewPage.enterTitle('title');
    await expect(viewPage.view.tab.title).toHaveText('title');
  });

  test('should allow updating the view tab heading', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPage.enterHeading('HEADING');
    await expect(viewPage.view.tab.heading).toHaveText('HEADING');

    await viewPage.enterHeading('heading');
    await expect(viewPage.view.tab.heading).toHaveText('heading');
  });

  test('should not display the view tab heading (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.view.tab.heading).not.toBeVisible();
  });

  test('should not display the view tab heading if the tab height < 3.5rem', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.4rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.view.tab.heading).not.toBeVisible();
  });

  test('should display the view tab heading if the tab height >= 3.5rem', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterHeading('heading');
    await expect(viewPage.view.tab.heading).toBeVisible();
    await expect(viewPage.view.tab.heading).toHaveText('heading');
  });

  test('should allow to mark the view dirty', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(false);

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);

    // Mark the view pristine
    await viewPage.checkDirty(false);
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(false);
  });

  test('should unset the dirty state when navigating to a different route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewId = await viewPage.view.getViewId();

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);

    // Navigate to a different route in the same view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // Expect the view to be pristine
    const testeeView = appPO.view({viewId});
    await expect.poll(() => testeeView.tab.isDirty()).toBe(false);
  });

  test('should not unset the dirty state when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Mark the view dirty
    await viewPage.checkDirty(true);
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);

    // Update matrix params (does not affect routing)
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(await viewPage.view.getViewId());
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the view to still be dirty
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);

    // Verify matrix params have changed
    await viewPage.view.tab.click();
    await expect.poll(() => viewPage.getParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the title when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Set the title
    await viewPage.enterTitle('TITLE');
    await expect(viewPage.view.tab.title).toHaveText('TITLE');

    // Update matrix params (does not affect routing)
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(await viewPage.view.getViewId());
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the title has not changed
    await expect(viewPage.view.tab.title).toHaveText('TITLE');
    // Verify matrix params have changed
    await viewPage.view.tab.click();
    await expect.poll(() => viewPage.getParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the heading when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Set the heading
    await viewPage.enterHeading('HEADING');
    await expect(viewPage.view.tab.heading).toHaveText('HEADING');

    // Update matrix params (does not affect routing)
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({matrixParam: 'value'});
    await routerPage.clickNavigate();

    // Expect the heading has not changed
    await expect(viewPage.view.tab.heading).toHaveText('HEADING');

    // Verify matrix params have changed
    await expect.poll(() => viewPage.getParams()).toEqual({matrixParam: 'value'});
  });

  test('should remove the closing handle from the view tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect(viewPage.view.tab.closeButton).toBeVisible();

    // Prevent the view from being closed
    await viewPage.checkClosable(false);
    await expect(viewPage.view.tab.closeButton).not.toBeVisible();

    // Mark the view closable
    await viewPage.checkClosable(true);
    await expect(viewPage.view.tab.closeButton).toBeVisible();
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to testee-1 view
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ComponentInstanceId = await testee1ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-2 view
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ComponentInstanceId = await testee2ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-1 view
    await testee1ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-2 view
    await testee2ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-3 view
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee3ComponentInstanceId = await testee3ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-1 view
    await testee1ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();
  });

  test('should allow to close the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.clickClose();

    await expect(appPO.views()).toHaveCount(0);
    await expectView(viewPage).not.toBeAttached();
  });

  test(`should disable context menu 'Close tab' for 'non-closable' view`, async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    const contextMenu1 = await viewPage.view.tab.openContextMenu();
    // Expect menu item to be enabled.
    await expect(contextMenu1.menuItems.closeTab.locator).not.toBeDisabled();

    await viewPage.checkClosable(false);
    const contextMenu2 = await viewPage.view.tab.openContextMenu();
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
    const contextMenu = await viewPage1.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect view 2 not to be closed because not closable.
    await expect(appPO.views()).toHaveCount(1);
    await expectView(viewPage2).toBeActive();
  });

  test('should detach view if not active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open two views.
    const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Expect view 2 to be visible.
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();

    // Activate view 1.
    await viewPage1.view.tab.click();

    // Expect view 1 to be visible.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive();
  });

  test('should detach view if opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open two views in main area.
    const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Capture instance id of view 2
    const view2ComponentId = await viewPage2.getComponentInstanceId();

    // Drag view 2 into peripheral area.
    await viewPage2.view.tab.dragTo({grid: 'workbench', region: 'east'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Maximize the main area.
    await viewPage1.view.tab.dblclick();
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).not.toBeAttached();

    // Restore the layout.
    await viewPage1.view.tab.dblclick();
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Expect view 2 not to be instantiated anew
    await expect.poll(() => viewPage2.getComponentInstanceId()).toEqual(view2ComponentId);
  });
});
