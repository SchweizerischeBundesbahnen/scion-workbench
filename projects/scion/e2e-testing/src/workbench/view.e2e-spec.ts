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
import {NavigationTestPagePO} from './page-object/test-pages/navigation-test-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {WorkbenchNavigator} from './workbench-navigator';
import {StartPagePO} from '../start-page.po';

test.describe('Workbench View', () => {

  test('should provide the view\'s identity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPage.navigate(['/test-view'], {
      target: 'view.100',
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    await expect(viewPage.viewId).toHaveText('view.100');
  });

  test('should allow updating the view tab title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPage.enterTitle('TITLE');
    await expect(viewPage.view.tab.title).toHaveText('TITLE');

    await viewPage.enterTitle('title');
    await expect(viewPage.view.tab.title).toHaveText('title');
  });

  test('should show title of inactive views when reloading the application', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/navigation-test-page', {title: 'view-1-title'}], {
      target: 'view.101',
    });

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page', {title: 'view-2-title'}], {
      target: 'view.102',
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});

    // reload the application
    await appPO.reload();

    await expectView(testee1ViewPage).toBeInactive();
    await expect(testee1ViewPage.view.tab.title).toHaveText('view-1-title');

    await expectView(testee2ViewPage).toBeActive();
    await expect(testee2ViewPage.view.tab.title).toHaveText('view-2-title');
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
    await routerPage.navigate(['test-router'], {
      target: viewId,
    });

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
    await routerPage.navigate(['test-view', {matrixParam: 'value'}], {
      target: await viewPage.view.getViewId(),
    });

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
    await routerPage.navigate(['test-view', {matrixParam: 'value'}], {
      target: await viewPage.view.getViewId(),
    });

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
    await routerPage.navigate(['test-view', {matrixParam: 'value'}]);

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

  test('should close a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.clickClose();

    await expect(appPO.views()).toHaveCount(0);
    await expectView(viewPage).not.toBeAttached();
  });

  test('should prevent closing a view', async ({appPO, page, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Prevent the view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Close view via view tab (prevent).
    await testeeViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view via WorkbenchView handle (prevent).
    await testeeViewPage.clickClose();
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view via close keystroke (prevent).
    await testeeViewPage.view.tab.click();
    await page.keyboard.press('Control+K');
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close all views via close keystroke (prevent).
    await testeeViewPage.view.tab.click();
    await page.keyboard.press('Control+Shift+Alt+K');
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view via router (prevent).
    // Do not wait for the navigation to complete because the message box blocks navigation.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {target: await testeeViewPage.view.getViewId(), close: true, waitForNavigation: false});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeInactive();

    // Close all views via router (prevent).
    // Do not wait for the navigation to complete because the message box blocks navigation.
    await routerPage.navigate(['test-view'], {close: true, waitForNavigation: false});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeInactive();

    // Close view.
    await testeeViewPage.view.tab.close();
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should close confirmed views, leaving other views open', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee1ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Close all views.
    const contextMenu = await testee3ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect all views to still be opened.
    await expect(appPO.views()).toHaveCount(3);

    // Confirm closing view 1.
    const canCloseMessageBox1 = appPO.messagebox({cssClass: ['e2e-close-view', await testee1ViewPage.view.getViewId()]});
    await canCloseMessageBox1.clickActionButton('yes');

    // Prevent closing view 2.
    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 1 and view 3 to be closed.
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
  });

  test('should close view and log error if `CanClose` guard errors', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee1ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Close all views.
    const contextMenu = await testee3ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect all views to still be opened.
    await expect(appPO.views()).toHaveCount(3);

    // Simulate `CanClose` guard of view 1 to error.
    const canCloseMessageBox1 = appPO.messagebox({cssClass: ['e2e-close-view', await testee1ViewPage.view.getViewId()]});
    await canCloseMessageBox1.clickActionButton('error');

    // Prevent closing view 2.
    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 1 and view 3 to be closed.
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();

    await expect.poll(() => consoleLogs.contains({severity: 'error', message: /\[CanCloseSpecError] Error in CanLoad of view 'view\.1'\./})).toBe(true);
  });

  test(`should disable context menu 'Close tab' for 'non-closable' view`, async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    const contextMenu1 = await viewPage.view.tab.openContextMenu();
    // Expect menu item to be enabled.
    await expect(contextMenu1.menuItems.closeTab.locator).not.toBeDisabled();
    await contextMenu1.pressEscape();

    await viewPage.checkClosable(false);
    const contextMenu2 = await viewPage.view.tab.openContextMenu();
    // Expect menu item to be disabled.
    await expect(contextMenu2.menuItems.closeTab.locator).toBeDisabled();
    await contextMenu2.pressEscape();
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

  /**
   * Tests to unset the "markedForRemoval" flag after navigation, i.e., that a subsequent layout operation does not invoke the `CanClose` guard again.
   */
  test('should unset `markedForRemoval` flag after navigation', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Prevent the view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Try closing the view.
    await testeeViewPage.view.tab.close();

    // Prevent closing the view.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');

    // Expect view not to be closed.
    await expectView(testeeViewPage).toBeActive();

    // Perform navigation after prevented closing.
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]}).locator).not.toBeAttached();
  });

  test('should not invoke `CanClose` guard when dragging view in the same layout in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ViewId = await testee1ViewPage.view.getViewId();

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ViewId = await testee2ViewPage.view.getViewId();

    // Prevent the view from closing.
    await testee2ViewPage.checkConfirmClosing(true);

    // Test `CanClose` guard to be installed.
    await testee2ViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testee2ViewPage).toBeActive();

    // Drag view in the layout.
    await testee2ViewPage.view.tab.dragTo({partId: await testee2ViewPage.view.part.getPartId(), region: 'east'});

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be dragged.
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            views: [{id: testee1ViewId}],
            activeViewId: testee1ViewId,
          }),
          child2: new MPart({
            views: [{id: testee2ViewId}],
            activeViewId: testee2ViewId,
          }),
        }),
      },
    });
  });

  test('should not invoke `CanClose` guard when dragging view in the same layout into the peripheral area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ViewId = await testee1ViewPage.view.getViewId();

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ViewId = await testee2ViewPage.view.getViewId();

    // Prevent the view from closing.
    await testee2ViewPage.checkConfirmClosing(true);

    // Test `CanClose` guard to be installed.
    await testee2ViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testee2ViewPage).toBeActive();

    // Drag view in the layout.
    await testee2ViewPage.view.tab.dragTo({grid: 'workbench', region: 'east'});

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be dragged.
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .8,
          child1: new MPart({id: MAIN_AREA}),
          child2: new MPart({
            views: [{id: testee2ViewId}],
            activeViewId: testee2ViewId,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testee1ViewId}],
          activeViewId: testee1ViewId,
        }),
      },
    });
  });

  test('should not invoke `CanClose` guard when dragging view to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ViewId = await testee1ViewPage.view.getViewId();

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ViewId = await testee2ViewPage.view.getViewId();

    // Prevent the view from closing.
    await testee2ViewPage.checkConfirmClosing(true);

    // Test `CanClose` guard to be installed.
    await testee2ViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testee2ViewPage).toBeActive();

    // Move view to new window
    const newAppPO = await testee2ViewPage.view.tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
    await expectView(new ViewPagePO(newWindow.appPO, {viewId: 'view.1'})).toBeActive();

    // Expect view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testee1ViewId}],
          activeViewId: testee1ViewId,
        }),
      },
    });
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();
  });

  test('should not invoke `CanClose` guard when dragging view to another window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ViewId = await testee1ViewPage.view.getViewId();

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ViewId = await testee2ViewPage.view.getViewId();

    // Prevent the view from closing.
    await testee2ViewPage.checkConfirmClosing(true);

    // Test `CanClose` guard to be installed.
    await testee2ViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testee2ViewPage).toBeActive();

    // Open new browser window.
    const newAppPO = await appPO.openNewWindow();
    await newAppPO.navigateTo({microfrontendSupport: false});

    // Move view to new browser window.
    const startPagePartId = (await new StartPagePO(newAppPO).getPartId())!;
    await testee2ViewPage.view.tab.moveTo(startPagePartId, {
      workbenchId: await newAppPO.getWorkbenchId(),
    });

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
    await expectView(new ViewPagePO(newAppPO, {viewId: 'view.1'})).toBeActive();

    // Expect view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testee1ViewId}],
          activeViewId: testee1ViewId,
        }),
      },
    });
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();
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

  test('should not destroy the component of the view when it is inactivated', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    const componentInstanceId = await viewPage.getComponentInstanceId();

    // activate the router test view
    await routerPage.view.tab.click();
    await expectView(routerPage).toBeActive();
    await expectView(viewPage).toBeInactive();

    // activate the test view
    await viewPage.view.tab.click();
    await expectView(viewPage).toBeActive();
    await expectView(routerPage).toBeInactive();

    // expect the component not to be constructed anew
    await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should change detect active views after construction', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/navigation-test-page', {title: 'View Title'}], {
      target: 'view.100',
      activate: true,
      cssClass: 'testee'
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect(viewPage.view.tab.title).toHaveText('View Title');
  });

  test('should change detect inactive views after construction', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/navigation-test-page', {title: 'View Title'}], {
      target: 'view.100',
      activate: false,
      cssClass: 'testee'
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect(viewPage.view.tab.title).toHaveText('View Title');
  });
});
