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
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';

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

  test('should close view via close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Click the close button.
    await viewPage.view.tab.closeButton.click();
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should close view via Ctrl+K keystroke', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
    await testPage.clickInputField();

    // Close view by pressing Ctrl+K.
    await page.keyboard.press('Control+K');
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should close view via middle mouse button', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
    await testPage.clickInputField();

    // Close view by pressing the middle mouse button.
    await testPage.view.tab.locator.click({button: 'middle'});
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should close view via context menu', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open context menu and click 'Close' menu item.
    const contextMenu = await viewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeTab.click();
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should close other views when pressing Alt and clicking close', async ({appPO, page, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.left', activateView: true})
      .addView('view.103', {partId: 'part.left'})
      .addView('view.201', {partId: 'part.right'})
      .addView('view.202', {partId: 'part.right'})
      .addView('view.203', {partId: 'part.right'}),
    );

    // Press Alt + Click close.
    await appPO.view({viewId: 'view.102'}).tab.closeButton.click({modifiers: ['Alt']});

    // Expect all views except 'view.102' to be closed in 'part.left'.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'part.left',
            views: [{id: 'view.102'}],
            activeViewId: 'view.102',
          }),
          child2: new MPart({
            id: 'part.right',
            views: [{id: 'view.201'}, {id: 'view.202'}, {id: 'view.203'}],
          }),
        }),
      },
    });
  });

  test('should activate view when closing other tabs', async ({appPO, page, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main', activateView: true})
      .addView('view.102', {partId: 'part.main'})
      .addView('view.103', {partId: 'part.main'}),
    );

    // Expect view.101 to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part.main',
          views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}],
          activeViewId: 'view.101',
        }),
      },
    });

    // Press Alt + Click close.
    await appPO.view({viewId: 'view.102'}).tab.hover();
    await appPO.view({viewId: 'view.102'}).tab.closeButton.click({modifiers: ['Alt']});

    // Expect all views except 'view.102' to be closed in 'part.left'.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part.main',
          views: [{id: 'view.102'}],
          activeViewId: 'view.102',
        }),
      },
    });
  });

  test('should prevent closing a view (via view tab, view handle, keystroke, router)', async ({appPO, page, workbenchNavigator}) => {
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

    // Close view via router (target) (prevent).
    // Do not wait for the navigation to complete because the message box blocks navigation.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {target: await testeeViewPage.view.getViewId(), close: true, waitForNavigation: false});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeHidden();

    // Activate test view.
    await testeeViewPage.view.tab.click();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Activate router view.
    await routerPage.view.tab.click();

    // Close view via router (path) (prevent).
    // Do not wait for the navigation to complete because the message box blocks navigation.
    await routerPage.navigate(['test-view'], {close: true, waitForNavigation: false});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeHidden();

    // Activate test view.
    await testeeViewPage.view.tab.click();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view.
    await testeeViewPage.view.tab.close();
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should prevent closing a view using a `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view.
    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage.checkConfirmClosing(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Confirm closing.
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testeeViewPage).not.toBeAttached();
  });

  /** @deprecated since version 1.0.0-beta.28. No longer needed with the removal of class-based {@link CanClose} guard. */
  test('should prevent closing a view using the deprecated class-based `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view.
    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage.checkConfirmClosing(true);
    await testeeViewPage.checkUseClassBasedCanCloseGuard(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Confirm closing.
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should unregister `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view.
    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage.checkConfirmClosing(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Unregister `CanClose` guard.
    await testeeViewPage.checkConfirmClosing(false);

    // Close view.
    await testeeViewPage.view.tab.close();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  /** @deprecated since version 1.0.0-beta.28. No longer needed with the removal of class-based {@link CanClose} guard. */
  test('should unregister deprecated class-based `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view.
    const testeeViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage.checkConfirmClosing(true);
    await testeeViewPage.checkUseClassBasedCanCloseGuard(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Unregister `CanClose` guard.
    await testeeViewPage.checkConfirmClosing(false);

    // Close view.
    await testeeViewPage.view.tab.close();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should close confirmed views, leaving other views open', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee3ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 4.
    const testee4ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Close all views.
    const contextMenu = await testee4ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect view 1 and view 4 to be closed.
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expectView(testee4ViewPage).not.toBeAttached();

    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    const canCloseMessageBox3 = appPO.messagebox({cssClass: ['e2e-close-view', await testee3ViewPage.view.getViewId()]});

    // Test that the closing of view 2 and view 3 is blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox3)).toBeVisible();

    // Confirm closing view 3.
    await canCloseMessageBox3.clickActionButton('yes');

    // Prevent closing view 2.
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 2 not to be closed.
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
  });

  test('should close view and log error if `CanClose` guard errors', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view 1.
    const testee1ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test view 2.
    const testee2ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testee3ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 4.
    const testee4ViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Close all views.
    const contextMenu = await testee4ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect view 1 and view 4 to be closed.
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expectView(testee4ViewPage).not.toBeAttached();

    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    const canCloseMessageBox3 = appPO.messagebox({cssClass: ['e2e-close-view', await testee3ViewPage.view.getViewId()]});

    // Test that the closing of view 2 and view 3 is blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox3)).toBeVisible();

    // Simulate `CanClose` guard of view 3 to error.
    await canCloseMessageBox3.clickActionButton('error');

    // Assert error.
    await expect.poll(() => consoleLogs.contains({severity: 'error', message: /\[CanCloseSpecError] Error in CanLoad of view 'view\.3'\./})).toBe(true);

    // Prevent closing view 2.
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 2 not to be closed.
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
  });

  test('should not block workbench router in `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1 (prevent it from closing).
    const testeeViewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage1.checkConfirmClosing(true);

    // Close view 1 (prevented).
    await testeeViewPage1.view.tab.close();
    const canCloseMessageBox1 = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage1.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).toBeVisible();
    await expectView(testeeViewPage1).toBeActive();

    // Open view 2 (prevent it from closing).
    const testeeViewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await testeeViewPage2.checkConfirmClosing(true);
    await expectView(testeeViewPage1).toBeInactive();
    await expectView(testeeViewPage2).toBeActive();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).toBeHidden();

    // Open view 3.
    const testeeViewPage3 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expectView(testeeViewPage1).toBeInactive();
    await expectView(testeeViewPage2).toBeInactive();
    await expectView(testeeViewPage3).toBeActive();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).toBeHidden();

    // Close view 2 (prevented).
    await testeeViewPage2.view.tab.close();
    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage2.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();
    await expectView(testeeViewPage1).toBeInactive();
    await expectView(testeeViewPage2).toBeInactive();
    await expectView(testeeViewPage3).toBeActive();

    // Activate view 1.
    await testeeViewPage1.view.tab.click();
    await expectView(testeeViewPage1).toBeActive();
    await expectView(testeeViewPage2).toBeInactive();
    await expectView(testeeViewPage3).toBeInactive();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).toBeVisible();

    // Confirm closing view 1.
    await canCloseMessageBox1.clickActionButton('yes');
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).toBeInactive();
    await expectView(testeeViewPage3).toBeActive();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).not.toBeAttached();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();

    // Close view 3.
    await testeeViewPage3.view.tab.close();
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).toBeActive();
    await expectView(testeeViewPage3).not.toBeAttached();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).not.toBeAttached();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeVisible();

    // Confirm closing view 2.
    await canCloseMessageBox2.clickActionButton('yes');
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).not.toBeAttached();
    await expectView(testeeViewPage3).not.toBeAttached();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox1)).not.toBeAttached();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).not.toBeAttached();
  });

  test('should unregister `CanClose` guard when navigating to a different page (different route)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view via router.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {navigation: '1'}], {
      target: 'view.101',
    });

    // Expect view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();
    await expect.poll(() => testeeViewPage.getParams()).toEqual({navigation: '1'});

    // Prevent view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Test that closing the view must be confirmed.
    await testeeViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Navigate view to the same page.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {navigation: '2'}], {
      target: 'view.101',
    });

    // Expect view to be navigated.
    await expectView(testeeViewPage).toBeActive();
    await expect.poll(() => testeeViewPage.getParams()).toEqual({navigation: '2'});

    // Navigate view to different page (RouterPage)
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-router'], {
      target: 'view.101',
    });

    // Expect view to be navigated.
    const differentPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await expectView(differentPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // Close view.
    await differentPage.view.tab.close();

    // Expect view to be closed without confirmation.
    await expectView(differentPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should not unregister `CanClose` guard when navigating to the same page (same route)', async ({appPO, page, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view via router.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {navigation: '1'}], {
      target: 'view.101',
    });

    // Expect view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();
    await expect.poll(() => testeeViewPage.getParams()).toEqual({navigation: '1'});

    // Prevent view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Test that closing the view must be confirmed.
    await testeeViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Navigate view to the same page.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {navigation: '2'}], {
      target: 'view.101',
    });

    // Expect view to be navigated.
    await expectView(testeeViewPage).toBeActive();
    await expect.poll(() => testeeViewPage.getParams()).toEqual({navigation: '2'});

    // Test that closing the view must be confirmed.
    await testeeViewPage.view.tab.close();
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should skip navigation if the layout has not changed, such as when only closing views with a `CanClose` guard', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // Open test view.
    await routerPage.navigate(['test-view'], {target: 'view.100'});
    const testViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await testViewPage.checkConfirmClosing(true);
    await expectView(testViewPage).toBeActive();

    // Close test view.
    await testViewPage.view.tab.close();

    // Expect the closing of the test view to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', 'view.100']});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testViewPage).toBeActive();

    // Prevent closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).not.toBeAttached();
    await expectView(testViewPage).toBeActive();

    // Perform history back.
    await appPO.navigateBack();

    // Expect test view not to be opened.
    await expectView(routerPage).toBeActive();
    await expectView(testViewPage).not.toBeAttached();
  });

  test('should only create browser history entry when confirming closing a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // Open test view.
    await routerPage.navigate(['test-view'], {target: 'view.100'});
    const testViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await testViewPage.checkConfirmClosing(true);
    await expectView(testViewPage).toBeActive();

    // Close test view.
    await testViewPage.view.tab.close();

    // Expect the closing of the test view to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', 'view.100']});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testViewPage).toBeActive();

    // Confirm closing.
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testViewPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();

    // Perform history back.
    await appPO.navigateBack();

    // Expect test view to be opened.
    await expectView(routerPage).toBeInactive();
    await expectView(testViewPage).toBeActive();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).not.toBeAttached();

    // Perform history back.
    await appPO.navigateBack();

    // Expect test view not to be opened.
    await expectView(routerPage).toBeActive();
    await expectView(testViewPage).not.toBeAttached();
  });

  test('should not invoke `CanClose` guard while blocking', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/blocking-can-close-test-page'], {target: 'view.100'});
    const testView = appPO.view({viewId: 'view.100'});

    // Close view.
    await testView.tab.close();

    // Expect `CanClose` guard to be invoked.
    await expect.poll(() => consoleLogs.get()).toContain('[BlockingCanCloseTestPageComponent] BLOCKING');

    // Clear log.
    consoleLogs.clear();

    // Expect view not to be closable until `CanClose` guard is released.
    await expect(testView.tab.closeButton).not.toBeVisible();

    // Close all views.
    await routerPage.view.tab.click();
    const contextMenu = await routerPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect `CanClose` guard not to be invoked again.
    await expect.poll(() => consoleLogs.get()).not.toContain('[BlockingCanCloseTestPageComponent] BLOCKING');

    // Expect view not to be closable until `CanClose` guard is released.
    await expect(testView.tab.closeButton).not.toBeVisible();
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
    const dragHandle = await testee2ViewPage.view.tab.startDrag();
    await dragHandle.dragToPart(await testee2ViewPage.view.part.getPartId(), {region: 'east'});
    await dragHandle.drop();

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be dragged.
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
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
    const dragHandle = await testee2ViewPage.view.tab.startDrag();
    await dragHandle.dragToEdge('east');
    await dragHandle.drop();

    // Expect `CanClose` guard not to be invoked.
    await expect(appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]}).locator).not.toBeAttached();

    // Expect view to be dragged.
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
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
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
    await expectView(new ViewPagePO(newWindow.appPO, {viewId: 'view.1'})).toBeActive();

    // Expect view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
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
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
    await expectView(new ViewPagePO(newAppPO, {viewId: 'view.1'})).toBeActive();

    // Expect view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
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
    const dragHandle = await viewPage2.view.tab.startDrag();
    await dragHandle.dragToEdge('east');
    await dragHandle.drop();

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
      cssClass: 'testee',
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
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect(viewPage.view.tab.title).toHaveText('View Title');
  });

  test('should have no position and size when inactive', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1.
    const viewPage1 = await SizeTestPagePO.openInNewTab(appPO);
    await expectView(viewPage1).toBeActive();
    const size = await viewPage1.getBoundingBox();

    // Open view 2.
    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();

    // Activate view 1.
    await viewPage1.view.tab.click();
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive();

    // Expect view to have zero position and size when inactive.
    await expect.poll(() => viewPage1.getRecordedSizeChanges()).toEqual([
      `x=${size.x}, y=${size.y}, width=${size.width}, height=${size.height}`,
      'x=0, y=0, width=0, height=0',
      `x=${size.x}, y=${size.y}, width=${size.width}, height=${size.height}`,
    ]);
  });
});
