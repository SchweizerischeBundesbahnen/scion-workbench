/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
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
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {NavigationTestPagePO} from './page-object/test-pages/navigation-test-page.po';
import {ViewInfo} from './page-object/view-info-dialog.po';

test.describe('Workbench Router', () => {

  test('should ignore matrix params when resolving views for activation', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {param: '1'}], {
      target: 'view.101',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: '2'}]);

    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: '3'}]);

    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should ignore matrix params when resolving views for closing', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {param: '1'}], {
      target: 'view.101',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: '2'}], {
      target: 'view.102',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: '3'}], {
      target: 'view.103',
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expectView(testee3ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(4);

    // close all test views
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: '1'}], { // matrix param is ignored when closing views
      close: true,
    });

    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should not throw outlet activation error when opening a new view tab once a view tab was closed', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.views({cssClass: 'e2e-start-page'})).toHaveCount(1);

    // close view tab
    await appPO.view({cssClass: 'e2e-start-page'}).tab.close();
    await expect(appPO.views({cssClass: 'e2e-start-page'})).toHaveCount(0);

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.views({cssClass: 'e2e-start-page'})).toHaveCount(1);
    // expect no error to be thrown
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.views({cssClass: 'e2e-start-page'})).toHaveCount(2);

    // expect no error to be thrown
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
  });

  test('should allow closing all views by pressing CTRL+ALT+SHIFT+K keystroke', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open multiple test view tabs
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // close all view tabs
    await appPO.activePart({inMainArea: true}).closeViewTabs();

    await expect(appPO.views()).toHaveCount(0);

    // expect no error to be thrown
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
  });

  test('should allow closing multiple views via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open multiple test view tabs
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(10);

    // close all test views via router
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      close: true,
    });

    await expect(appPO.views()).toHaveCount(1);
  });

  test('should allow closing a single view by viewId via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.102',
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // close the view 1
    await routerPage.view.tab.click();
    await routerPage.navigate([], {
      target: 'view.101',
      close: true,
    });

    // expect the view 1 to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should error when trying to close a view that does not exist', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'blank',
      cssClass: 'testee-1',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'blank',
      cssClass: 'testee-2',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // try closing view 100
    await routerPage.view.tab.click();
    await expect(routerPage.navigate([], {
      target: 'view.100',
      close: true,
    })).rejects.toThrow(/NullViewError/);
  });

  test('should reject closing a view by viewId via router if a path is also given', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.100',
      activate: false,
    });

    // Expect to error when passing viewId and path
    await expect(routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.100',
      close: true,
    })).rejects.toThrow(/\[NavigateError]/);

    // Expect to error when passing viewId and hint
    await expect(routerPage.navigate([], {
      target: 'view.100',
      hint: 'hint',
      close: true,
    })).rejects.toThrow(/\[NavigateError]/);

    // Expect view not to be closed.
    const testeeViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.100'});
    await expectView(testeeViewPage).toBeInactive();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.103',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});

    // expect the test view to be closed
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.103',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/1'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});

    // expect the test view to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).not.toBeAttached();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2'], {
      target: 'view.103',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/*'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/*'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});

    // expect the test view to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).not.toBeAttached();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/1/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/1'], {
      target: 'view.103',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/2'], {
      target: 'view.104',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/1'], {
      target: 'view.105',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/2'], {
      target: 'view.106',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/1/1'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/1'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.104'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.105'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.106'});

    // expect the test view to be closed
    await expect(appPO.views()).toHaveCount(6);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).toBeInactive();
    await expectView(testee5ViewPage).toBeInactive();
    await expectView(testee6ViewPage).toBeInactive();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/1'], {
      target: 'view.103',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/2'], {
      target: 'view.104',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/1'], {
      target: 'view.105',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/2'], {
      target: 'view.106',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/1'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/*/1'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.104'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.105'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.106'});

    // expect the test view to be closed
    await expect(appPO.views()).toHaveCount(5);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).toBeInactive();
    await expectView(testee5ViewPage).not.toBeAttached();
    await expectView(testee6ViewPage).toBeInactive();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*/*` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page'], {
      target: 'view.101',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1'], {
      target: 'view.102',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/1'], {
      target: 'view.103',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/1/2'], {
      target: 'view.104',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/1'], {
      target: 'view.105',
    });

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/2/2'], {
      target: 'view.106',
    });

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/*'
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-pages/navigation-test-page/*/*'], {
      close: true,
    });

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.103'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.104'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.105'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.106'});

    // expect the test view to be closed
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
    await expectView(testee5ViewPage).not.toBeAttached();
    await expectView(testee6ViewPage).not.toBeAttached();
  });

  test('should allow opening a view in a new view tab [target=blank]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);

    // expect the test view to be opened
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should allow opening a view in the current view tab [target=viewId]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPage.view.getViewId();

    // navigate to the test view
    await routerPage.navigate(['test-view'], {
      target: routerViewId,
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened in the same tab
    await expect.poll(() => testeeViewPage.view.getViewId()).toEqual(routerViewId);
    await expect(appPO.views()).toHaveCount(1);

    // expect the test view to be opened
    await expectView(testeeViewPage).toBeActive();
  });

  test('should open a new view instead of activating a present view [target=blank]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-1',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // navigate to a new test view
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-2',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect a new test view to be opened
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
  });

  test('should open view in the specified part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part on the right.
    await workbenchNavigator.modifyLayout(layout => layout.addPart('right', {align: 'right'}));

    // Open view in the right part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      partId: 'right',
      cssClass: 'testee',
    });

    // Expect view to be opened in the right part.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        partId: 'right',
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should navigate existing view(s) in the specified part, or open a new view in the specified part otherwise', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add left and right part.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left'})
      .addPart('right', {align: 'right'})
      .addView('view.100', {partId: 'left'})
      .navigateView('view.100', ['test-view']),
    );

    // Navigate view in the left part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      partId: 'left',
      state: {navigated: '1'},
      cssClass: 'testee-1',
    });

    // Expect existing view in the left part to be navigated.
    const view1 = appPO.view({cssClass: 'testee-1'});
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        urlSegments: 'test-view',
        state: {navigated: '1'},
        partId: 'left',
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(2);

    // Navigate view in the right part.
    await routerPage.navigate(['test-view'], {
      partId: 'right',
      state: {navigated: '2'},
      cssClass: 'testee-2',
    });

    // Expect view in the left part not to be navigated.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        urlSegments: 'test-view',
        state: {navigated: '1'},
        partId: 'left',
      } satisfies Partial<ViewInfo>,
    );

    // Expect new view to be opened in the right part.
    const view2 = appPO.view({cssClass: 'testee-2'});
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        state: {navigated: '2'},
        partId: 'right',
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);
  });

  test('should open view in the active part of the main area if specified part is not in the layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add left part.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left'})
      .addView('view.100', {partId: 'left', activatePart: true, activateView: true})
      .navigateView('view.100', ['test-view'], {state: {navigated: 'false'}}),
    );

    // Open view in a part not contained in the layout.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      partId: 'does-not-exist',
      state: {navigated: 'true'},
      cssClass: 'testee',
    });

    // Expect view to be opened in the main area.
    await expect.poll(() => appPO.view({cssClass: 'testee'}).getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        partId: await appPO.activePart({inMainArea: true}).getPartId(),
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect view in the left part not to be navigated.
    await expect.poll(() => appPO.view({viewId: 'view.100'}).getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        urlSegments: 'test-view',
        partId: 'left',
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);
  });

  test('should open view in the active part of the workbench grid if specified part is not in the layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create perspective with a left and right part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('left')
      .addPart('right', {align: 'right'})
      .addView('router', {partId: 'left', cssClass: 'router'})
      .addView('view.100', {partId: 'right', activateView: true})
      .navigateView('router', ['test-router']),
    );

    // Add state via separate navigation as not supported when adding views to the perspective.
    await workbenchNavigator.modifyLayout(layout => layout.navigateView('view.100', ['test-view'], {state: {navigated: 'false'}}));

    // Open view in a part not contained in the layout.
    const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
    await routerPage.navigate(['test-view'], {
      partId: 'does-not-exist',
      state: {navigated: 'true'},
      cssClass: 'testee',
    });

    // Expect view to be opened in the active part.
    await expect.poll(() => appPO.view({cssClass: 'testee'}).getInfo()).toMatchObject(
      {
        urlSegments: 'test-view',
        partId: await appPO.activePart({inMainArea: false}).getPartId(),
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect view in the right part not to be navigated.
    await expect.poll(() => appPO.view({viewId: 'view.100'}).getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        urlSegments: 'test-view',
        partId: 'right',
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);
  });

  test('should activate a present view if setting `activate` to `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // expect the view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();

    // activate the view via routing
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      activate: true,
    });

    // expect the view to be activated and no new view to be opened
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should not activate a new view if set `activate` to `false`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-1',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // navigate to a new test view
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      activate: false,
      cssClass: 'testee-2',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect a new test view to be opened but not to be activated
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should open a new view if no present view can be found [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should navigate existing view(s) of the same path (path matches single view) [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // activate the router test view
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'auto',
    });

    // expect the present view to be activated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
  });

  test('should navigate existing view(s) of the same path (path matches multiple views) [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {param: 'value1'}], {
      target: 'view.101',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: 'value1'}], {
      target: 'view.102',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: 'value2'}], {
      target: 'auto',
    });

    // expect the present views to be updated
    await expect(appPO.views()).toHaveCount(3);

    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value2'});

    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value2'});
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should, by default, navigate existing view(s) of the same path (path matches single view) [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
    });

    const testeeView = new ViewPagePO(appPO, {viewId: 'view.100'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();

    // navigate to a present view
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view']);

    // expect the present view to be activated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();

    // navigate to a present view updating its matrix params
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: 'value1'}]);

    // expect the present view to be updated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();
    await expect.poll(() => testeeView.getParams()).toEqual({param: 'value1'});
  });

  test('should, by default, navigate existing view(s) of the same path (path matches multiple views) [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view', {param: 'value1'}], {
      target: 'view.101',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: 'value1'}], {
      target: 'view.102',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {param: 'value2'}]);

    // expect the present views to be updated
    await expect(appPO.views()).toHaveCount(3);

    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value2'});

    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value2'});
  });

  test('should open a new view if the target view is not found [target=viewId]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.99',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
  });

  test('should navigate views of the same path and hint [target=auto] (1/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', [], {hint: 'test-view', state: {navigated: 'false'}})
      .navigateView('view.102', [], {hint: 'test-router', state: {navigated: 'false'}}),
    );

    const testView1 = appPO.view({viewId: 'view.101'});
    const testView2 = appPO.view({viewId: 'view.102'});

    // Navigate to empty-path route with hint 'test-view'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {
      target: 'auto',
      hint: 'test-view',
      state: {navigated: 'true'},
    });

    // Expect view.101 to be navigated.
    await expect.poll(() => testView1.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view.102 not to be navigated.
    await expect.poll(() => testView2.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-router'},
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate views of the same path and hint [target=auto] (2/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', ['test-view'], {hint: 'test-view', state: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {state: {navigated: 'false'}}),
    );

    const testView1 = appPO.view({viewId: 'view.101'});
    const testView2 = appPO.view({viewId: 'view.102'});

    // Navigate to 'test-view' route without hint.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'auto',
      state: {navigated: 'true'},
    });

    // Expect view.101 not to be navigated.
    await expect.poll(() => testView1.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: 'test-view'},
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view.102 to be navigated.
    await expect.poll(() => testView2.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate views of the same path and hint [target=auto] (3/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', ['test-view'], {hint: 'test-view', state: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {hint: 'test-view', state: {navigated: 'false'}}),
    );

    const testView1 = appPO.view({viewId: 'view.101'});
    const testView2 = appPO.view({viewId: 'view.102'});

    // Navigate to 'test-view' route without hint.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'auto',
      hint: 'test-view',
      state: {navigated: 'true'},
    });

    // Expect view.101 to be navigated.
    await expect.poll(() => testView1.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: 'test-view'},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view.102 to be navigated.
    await expect.poll(() => testView2.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: 'test-view'},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate views of the same path and hint [target=auto] (4/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
      .addView('view.101', {partId: 'right', activateView: true})
      .navigateView('view.101', [], {hint: 'test-router', state: {navigated: 'false'}}),
    );

    const testView1 = appPO.view({viewId: 'view.101'});
    const testView2 = appPO.view({cssClass: 'testee'});

    // Navigate to empty-path route with hint 'test-view'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {
      target: 'auto',
      hint: 'test-view',
      state: {navigated: 'true'},
      cssClass: 'testee',
    });

    // Expect view.101 not to be navigated.
    await expect.poll(() => testView1.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-router'},
        state: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect testee to be navigated.
    await expect.poll(() => testView2.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
        state: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should close views of the same path and hint [target=auto] (1/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', [], {hint: 'test-view'})
      .navigateView('view.102', [], {hint: 'test-router'}),
    );

    const testView1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testView2 = new RouterPagePO(appPO, {viewId: 'view.102'});

    await expectView(testView1).toBeActive();
    await expectView(testView2).toBeActive();

    // Close views navigated to empty-path route with hint 'test-view'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {
      hint: 'test-view',
      close: true,
    });

    // Expect view.101 to be closed.
    await expectView(testView1).not.toBeAttached();
    // Expect view.102 not to be closed.
    await expectView(testView2).toBeActive();
  });

  test('should close views of the same path and hint [target=auto] (2/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', ['test-view'], {hint: 'test-view'})
      .navigateView('view.102', ['test-view']),
    );

    const testView1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testView2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    await expectView(testView1).toBeActive();
    await expectView(testView2).toBeActive();

    // Close views navigated to 'test-view' route without hint.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      close: true,
    });

    // Expect view.101 not to be closed.
    await expectView(testView1).toBeActive();
    // Expect view.102 to be closed.
    await expectView(testView2).not.toBeAttached();
  });

  test('should close views of the same path and hint [target=auto] (3/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
      .addView('view.101', {partId: 'right-top', activateView: true})
      .addView('view.102', {partId: 'right-bottom', activateView: true})
      .navigateView('view.101', ['test-view'], {hint: 'test-view'})
      .navigateView('view.102', ['test-view'], {hint: 'test-view'}),
    );

    const testView1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testView2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    await expectView(testView1).toBeActive();
    await expectView(testView2).toBeActive();

    // Close views navigated to 'test-view' route without hint.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      hint: 'test-view',
      close: true,
    });

    // Expect view.101 to be closed.
    await expectView(testView1).not.toBeAttached();
    // Expect view.102 to be closed.
    await expectView(testView2).not.toBeAttached();
  });

  test('should close views of the same path and hint [target=auto] (4/4)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
      .addView('view.101', {partId: 'right', activateView: true})
      .navigateView('view.101', [], {hint: 'test-router'}),
    );

    const testView1 = new RouterPagePO(appPO, {viewId: 'view.101'});

    // Close views navigated to empty-path route with hint 'test-view'.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {
      hint: 'test-view',
      close: true,
    });

    // Expect view.101 not to be closed.
    await expectView(testView1).toBeActive();
  });

  test('should close views in the specified part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add left and right part.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left'})
      .addPart('right', {align: 'right'})
      .addView('view.101', {partId: 'left'})
      .addView('view.102', {partId: 'left'})
      .addView('view.103', {partId: 'left'})
      .addView('view.104', {partId: 'right'})
      .navigateView('view.101', ['test-view/1'])
      .navigateView('view.102', ['test-view/1'])
      .navigateView('view.103', ['test-view/2'])
      .navigateView('view.104', ['test-view/1']),
    );

    // Close views in the left part
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view/1'], {
      partId: 'left',
      close: true,
    });

    // Expect views in the left part to be closed.
    await expect.poll(() => appPO.part({partId: 'left'}).getViewIds()).toEqual(['view.103']);

    // Expect view in the right part not to be closed.
    await expect.poll(() => appPO.part({partId: 'right'}).getViewIds()).toEqual(['view.104']);
  });

  test('should support app URL to contain view outlets of views in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left', ratio: .25})
      .addView('view.100', {partId: 'left', activateView: true})
      .navigateView('view.100', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect the view to be opened in the left part.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // WHEN: Opening the app with a URL that contains view outlets of views from the workbench grid
    await appPO.reload();

    // THEN: Expect the workbench layout to be restored.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect the test view to display.
    await expectView(viewPage).toBeActive();
  });

  test('should allow for navigation to an empty-path route in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left', ratio: .25})
      .addView('view.100', {partId: 'left', activateView: true})
      .navigateView('view.100', [], {hint: 'test-view'}),
    );

    // Expect the view to be opened in the left part.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(viewPage).toBeActive();
  });

  test('should allow for navigation to an empty-path route in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view in the main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate([], {
      target: 'view.100',
      hint: 'test-view',
    });
    await routerPage.view.tab.close();

    // Expect the view to be opened in the main area.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.100'}],
          activeViewId: 'view.100',
        }),
      },
    });

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(viewPage).toBeActive();
  });

  test('should navigate from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', ['test-router']),
    );

    // Navigate to path-based route.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', ['test-router']),
    );

    // Navigate to empty-path route.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigate([], {
      target: 'view.100',
      hint: 'test-view',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate from empty-path route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', [], {hint: 'test-router'}),
    );

    // Navigate to empty-path route.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigate([], {
      target: 'view.100',
      hint: 'test-view',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate from empty-path route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addView('view.100', {partId: activePartId})
      .navigateView('view.100', [], {hint: 'test-router'}),
    );

    // Navigate to path-based route.
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.100'});
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should resolve to correct route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test-view with {path: 'test-view'}
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
      } satisfies Partial<ViewInfo>,
    );
    await testeeViewPage.view.tab.close();

    // Open test-view with {path: 'test-view', hint: 'test-view'}
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      hint: 'test-view',
      cssClass: 'testee',
    });

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
    await testeeViewPage.view.tab.close();

    // Open test-view with {path: '', hint: 'test-view'}
    await routerPage.view.tab.click();
    await routerPage.navigate([], {
      hint: 'test-view',
      cssClass: 'testee',
    });

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should reject if no path or hint is set', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view without specifying path or hint.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await expect(routerPage.navigate([])).rejects.toThrow(/\[NavigateError]/);
  });

  test.describe('Navigate by alternativeViewId', () => {

    test('should navigate view by alternative view id', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('left')
        .addPart('right', {relativeTo: 'left', align: 'right'})
        .addView('router', {partId: 'left', activateView: true, cssClass: 'router'})
        .addView('testee', {partId: 'right', cssClass: 'testee'})
        .navigateView('router', ['test-router']),
      );

      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
      const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

      // Open test view, assigning it an alternative view id
      await routerPage.navigate(['test-pages/navigation-test-page/1'], {
        target: 'testee', // alternative view id
      });
      await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject({urlSegments: 'test-pages/navigation-test-page/1'} satisfies Partial<ViewInfo>);

      // Navigate the test view by its alternative view id
      await routerPage.navigate(['test-pages/navigation-test-page/2'], {
        target: 'testee', // alternative view id
      });
      await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject({urlSegments: 'test-pages/navigation-test-page/2'} satisfies Partial<ViewInfo>);
    });

    test('should close single view by alternative view id', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('left')
        .addPart('right', {relativeTo: 'left', align: 'right'})
        .addView('test-router', {partId: 'left', activateView: true, cssClass: 'router'})
        .addView('testee-1', {partId: 'right', cssClass: 'testee-1'})
        .addView('testee-2', {partId: 'right', cssClass: 'testee-2', activateView: true})
        .navigateView('test-router', ['test-router'])
        .navigateView('testee-1', ['test-view'])
        .navigateView('testee-2', ['test-view']),
      );

      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
      const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
      const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

      // Expect test views to be opened.
      await expect(appPO.views()).toHaveCount(3);

      // Close the view with alternative id 'testee-1'.
      await routerPage.navigate([], {
        target: 'testee-1',
        close: true,
      });

      // Expect the view with alternative id 'testee-1' to be closed.
      await expect(appPO.views()).toHaveCount(2);
      await expectView(routerPage).toBeActive();
      await expectView(testee1ViewPage).not.toBeAttached();
      await expectView(testee2ViewPage).toBeActive();
    });

    test('should close multiple views by alternative view id', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('left')
        .addPart('right', {relativeTo: 'left', align: 'right'})
        .addView('test-router', {partId: 'left', activateView: true, cssClass: 'router'})
        .addView('testee-1', {partId: 'right', cssClass: 'testee-1'})
        .addView('testee-1', {partId: 'right', cssClass: 'testee-2'})
        .addView('testee-2', {partId: 'right', cssClass: 'testee-3', activateView: true})
        .navigateView('test-router', ['test-router'])
        .navigateView('testee-1', ['test-view'])
        .navigateView('testee-2', ['test-view']),
      );

      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
      const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
      const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
      const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});

      // Expect test views to be opened
      await expect(appPO.views()).toHaveCount(4);

      // Close the views with alternative id 'testee-1'.
      await routerPage.navigate([], {
        target: 'testee-1',
        close: true,
      });

      // Expect the views with alterantive id 'testee-1' to be closed.
      await expect(appPO.views()).toHaveCount(2);
      await expectView(testee1ViewPage).not.toBeAttached();
      await expectView(testee2ViewPage).not.toBeAttached();
      await expectView(testee3ViewPage).toBeActive();
    });
  });
});
