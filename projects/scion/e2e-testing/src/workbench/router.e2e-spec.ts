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
import {LayoutPagePO} from './page-object/layout-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {NavigationTestPagePO} from './page-object/test-pages/navigation-test-page.po';

test.describe('Workbench Router', () => {

  test('should ignore matrix params when resolving views for activation', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '1'});
    await routerPage.checkActivate(true);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '2'});
    await routerPage.checkActivate(true);
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '3'});
    await routerPage.checkActivate(true);
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should ignore matrix params when resolving views for closing', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '1'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '2'});
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({param: '3'});
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expectView(testee3ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(4);

    // close all test views
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(undefined);
    await routerPage.enterMatrixParams({param: '1'});  // matrix param is ignored when closing views
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should show title of inactive views when reloading the application', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterMatrixParams({title: 'view-1-title'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.102');
    await routerPage.enterMatrixParams({title: 'view-2-title'});
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});

    // reload the application
    await appPO.reload();

    await expectView(testee1ViewPage).toBeInactive();
    await expect(testee1ViewPage.view.tab.title).toHaveText('view-1-title');

    await expectView(testee2ViewPage).toBeActive();
    await expect(testee2ViewPage.view.tab.title).toHaveText('view-2-title');
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
    await routerPage.enterPath('test-view');
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    await expect(appPO.views()).toHaveCount(1);
  });

  test('should allow closing a single view by viewId via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // close the view 1
    await routerPage.view.tab.click();
    await routerPage.enterPath('');
    await routerPage.enterTarget('view.101');
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the view 1 to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should ignore closing a view with an unknown viewId via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // close the unknown view 99
    await routerPage.view.tab.click();
    await routerPage.enterPath('');
    await routerPage.enterTarget('view.99');
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});

    // expect no view to be closed
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should reject closing a view by viewId via router if a path is also given', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // try closing view by providing viewId and path
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.checkClose(true);

    // expect closing to be rejected
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]\[IllegalArgumentError]/);

    const testee1ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {viewId: 'view.102'});

    await expect(appPO.views()).toHaveCount(3);
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the test view in a new view tab
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/*'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-5');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-6');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/1/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-4'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-5'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-6'});

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-5');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-6');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-4'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-5'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-6'});

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-5');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-6');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/*'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*/*');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-4'});
    const testee5ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-5'});
    const testee6ViewPage = new NavigationTestPagePO(appPO, {cssClass: 'testee-6'});

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
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(routerViewId);
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // navigate to a new test view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect a new test view to be opened
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
  });

  test('should activate a present view if setting `checkActivate` to `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();

    // activate the view via routing
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('auto');
    await routerPage.checkActivate(true);
    await routerPage.clickNavigate();

    // expect the view to be activated and no new view to be opened
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeViewPage).toBeActive();
  });

  test('should not activate a new view if set `activate` to `false`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.checkActivate(true); // activate the view
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // navigate to a new test view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterTarget('blank');
    await routerPage.checkActivate(false); // do not activate the view
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect a new test view to be opened but not to be activated
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
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

  test('should allow setting CSS class(es) via router (active view)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterTarget('view.99');
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.99'});
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
  });

  test('should open a new view if no present view can be found [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();

    // activate the router test view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

    // expect the present view to be activated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
  });

  test('should navigate existing view(s) of the same path (path matches multiple views) [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterMatrixParams({param: 'value1'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getRouteParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterMatrixParams({param: 'value1'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getRouteParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('auto');
    await routerPage.enterMatrixParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect the present views to be updated
    await expect(appPO.views()).toHaveCount(3);

    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getRouteParams()).toEqual({param: 'value2'});

    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getRouteParams()).toEqual({param: 'value2'});
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testeeView = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();

    // navigate to a present view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(''); // will be interpreted as undefined
    await routerPage.clickNavigate();

    // expect the present view to be activated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();

    // navigate to a present view updating its matrix params
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget(''); // will be interpreted as undefined
    await routerPage.enterMatrixParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect the present view to be updated
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testeeView).toBeActive();
    await expect.poll(() => testeeView.getRouteParams()).toEqual({param: 'value1'});
  });

  test('should, by default, navigate existing view(s) of the same path (path matches multiple views) [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterTarget('blank');
    await routerPage.enterMatrixParams({param: 'value1'});
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getRouteParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterTarget('blank');
    await routerPage.enterMatrixParams({param: 'value1'});
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getRouteParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('');
    await routerPage.enterMatrixParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect the present views to be updated
    await expect(appPO.views()).toHaveCount(3);

    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getRouteParams()).toEqual({param: 'value2'});

    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getRouteParams()).toEqual({param: 'value2'});
  });

  test('should open a new view if the target view is not found [target=viewId]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // navigate to the test view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
  });

  test('should support app URL to contain view outlets of views in the workbench grid', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Define perspective with a part on the left.
    await appPO.switchPerspective('perspective');
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});

    // Add view to the left part in the workbench grid.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.3'}], // test view page
            activeViewId: 'view.3',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          id: await layoutPage.view.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPage.view.part.getPartId(),
      },
    });

    // Capture current URL.
    const url = page.url();

    // Clear the browser URL.
    await page.goto('about:blank');

    // WHEN: Opening the app with a URL that contains view outlets of views from the workbench grid
    await appPO.navigateTo({url, microfrontendSupport: false, perspectives: ['perspective']});

    // THEN: Expect the workbench layout to be restored.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.3'}], // test view page
            activeViewId: 'view.3',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          id: await layoutPage.view.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPage.view.part.getPartId(),
      },
    });

    // Expect the test view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.3'});
    await expectView(viewPage).toBeActive();
  });

  test('should allow for navigation to an empty path auxiliary route in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Define perspective with a part on the left.
    await appPO.switchPerspective('perspective');
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});

    // Register auxiliary route.
    await layoutPage.registerRoute({path: '', outlet: 'testee', component: 'view-page'});

    // Open view in the left part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterTarget('testee');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'testee'}],
            activeViewId: 'testee',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          id: await layoutPage.view.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPage.view.part.getPartId(),
      },
    });

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'testee'});
    await expectView(viewPage).toBeActive();
  });

  test('should allow for navigation to an empty path auxiliary route in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register auxiliary route.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerRoute({path: '', outlet: 'testee', component: 'view-page'});

    // Open view in the left part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterTarget('testee');
    await routerPage.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          id: await layoutPage.view.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'testee'}], // layout page, router page, testee view
          activeViewId: 'testee',
        }),
        activePartId: await layoutPage.view.part.getPartId(),
      },
    });

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'testee'});
    await expectView(viewPage).toBeActive();
  });
});
