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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {NavigationTestPagePO} from './page-object/test-pages/navigation-test-page.po';
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {ViewInfo} from './page-object/view-info-dialog.po';

test.describe('Workbench Router', () => {

  test('should ignore matrix params when resolving views for activation', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open test view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterCommands(['test-view', {param: '1'}]);
    await routerPage.checkActivate(true);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: '2'}]);
    await routerPage.checkActivate(true);
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: '3'}]);
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
    await routerPage.enterCommands(['test-view', {param: '1'}]);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open test view 2
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: '2'}]);
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);

    // open test view 3
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: '3'}]);
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expectView(testee3ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(4);

    // close all test views
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: '1'}]); // matrix param is ignored when closing views
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]/);

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
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(4);

    // close the views with the path 'test-pages/navigation-test-page/*'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('view.104');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('view.105');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('view.106');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/1/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('view.104');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('view.105');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('view.106');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/1'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*/1');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-pages/navigation-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1');
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/1');
    await routerPage.enterTarget('view.103');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/1/2');
    await routerPage.enterTarget('view.104');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/1');
    await routerPage.enterTarget('view.105');
    await routerPage.clickNavigate();

    // open the test view in a new view tab
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/2/2');
    await routerPage.enterTarget('view.106');
    await routerPage.clickNavigate();

    // expect the test views to be opened
    await expect(appPO.views()).toHaveCount(7);

    // close the views with the path 'test-pages/navigation-test-page/*/*'
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-pages/navigation-test-page/*/*');
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

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
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

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
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

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
    await routerPage.enterCommands(['test-view', {param: 'value1'}]);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: 'value1'}]);
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: 'value2'}]);
    await routerPage.enterTarget('auto');
    await routerPage.clickNavigate();

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
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();

    const testeeView = new ViewPagePO(appPO, {viewId: 'view.100'});

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
    await routerPage.enterCommands(['test-view', {param: 'value1'}]);
    await routerPage.enterTarget(''); // will be interpreted as undefined
    await routerPage.clickNavigate();

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
    await routerPage.enterCommands(['test-view', {param: 'value1'}]);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // expect the param to be set
    await expect.poll(() => testee1ViewPage.getParams()).toEqual({param: 'value1'});

    // navigate to the test view 2
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: 'value1'}]);
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // expect the param to be set
    await expect.poll(() => testee2ViewPage.getParams()).toEqual({param: 'value1'});

    // update all matching present views
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {param: 'value2'}]);
    await routerPage.enterTarget('');
    await routerPage.clickNavigate();

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
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // expect the test view to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
  });

  test('should support app URL to contain view outlets of views in the workbench grid', async ({appPO, workbenchNavigator}) => {
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
    await expect(appPO.workbench).toEqualWorkbenchLayout({
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

  test('should allow for navigation to an empty-path route in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Define perspective with a part on the left.
    await appPO.switchPerspective('perspective');
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});

    // Open view in the left part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterOutlet('test-view');
    await routerPage.enterTarget('view.3');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.3'}],
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

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.3'});
    await expectView(viewPage).toBeActive();
  });

  test('should allow for navigation to an empty-path route in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view in the left part.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterOutlet('test-view');
    await routerPage.enterTarget('view.2');
    await routerPage.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}, {id: 'view.2'}], // router page, testee view
          activeViewId: 'view.2',
        }),
      },
    });

    // Expect the view to display.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.2'});
    await expectView(viewPage).toBeActive();
  });

  test('should open view when navigating from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to path-based route via router link.
    const pathBasedRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await pathBasedRouterPage.enterPath('test-view');
    await pathBasedRouterPage.enterCssClass('testee');
    await pathBasedRouterPage.clickNavigate();
    await pathBasedRouterPage.view.tab.close();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should open view when navigating from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as path-based route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-router');
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to empty-path route via router link.
    const pathBasedRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await pathBasedRouterPage.enterPath('');
    await pathBasedRouterPage.enterOutlet('test-view');
    await pathBasedRouterPage.enterCssClass('testee');
    await pathBasedRouterPage.clickNavigate();
    await pathBasedRouterPage.view.tab.close();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should open view when navigating from empty-path route route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterCssClass('test-router');
    await routerPage.enterOutlet('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to empty-path route via router link.
    const emptyPathRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await emptyPathRouterPage.enterPath('');
    await emptyPathRouterPage.enterOutlet('test-view');
    await emptyPathRouterPage.enterCssClass('testee');
    await emptyPathRouterPage.clickNavigate();
    await emptyPathRouterPage.view.tab.close();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display empty-path route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should open view when navigating from empty-path route route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open router page as empty-path route.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterCssClass('test-router');
    await routerPage.enterOutlet('test-router');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    // Navigate to path-based route via router link.
    const emptyPathRouterPage = new RouterPagePO(appPO, {cssClass: 'test-router'});
    await emptyPathRouterPage.enterPath('test-view');
    await emptyPathRouterPage.enterCssClass('testee');
    await emptyPathRouterPage.clickNavigate();
    await emptyPathRouterPage.view.tab.close();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view to display path-based route.
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should resolve to correct route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test-view with {path: 'test-view', outlet: ''}
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterOutlet('');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', outlet: 'primary'},
      } satisfies Partial<ViewInfo>,
    );
    await testeeViewPage.view.tab.close();

    // Open test-view with {path: 'test-view', outlet: 'test-view'}
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterOutlet('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', outlet: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
    await testeeViewPage.view.tab.close();

    // Open test-view with {path: '', outlet: 'test-view'}
    await routerPage.view.tab.click();
    await routerPage.enterPath('');
    await routerPage.enterOutlet('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect.poll(() => testeeViewPage.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', outlet: 'test-view'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should reject if no path or outlet is set', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view without specifying path or outlet.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterOutlet('');

    // Expect navigation to be rejected.
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]/);
  });

  test.describe('Navigate by alternativeViewId', () => {

    test('should open a new view if the target view is not found [target=alternativeViewId]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('testee');
      await routerPage.clickNavigate();

      const testeeViewPage = new ViewPagePO(appPO, {viewId: await appPO.resolveViewId('testee')});

      // expect the test view to be opened as new tab
      await expect(appPO.views()).toHaveCount(2);
      await expectView(routerPage).toBeInactive();
      await expectView(testeeViewPage).toBeActive();
    });

    test('should close a single view by alternativeViewId', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the test view in a new view tab
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.view.tab.click();
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('testee-1');
      await routerPage.clickNavigate();

      // open the test view in a new view tab
      await routerPage.view.tab.click();
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('testee-2');
      await routerPage.clickNavigate();

      const testee1ViewPage = new ViewPagePO(appPO, {viewId: await appPO.resolveViewId('testee-1')});
      const testee2ViewPage = new ViewPagePO(appPO, {viewId: await appPO.resolveViewId('testee-2')});

      // expect the test views to be opened
      await expect(appPO.views()).toHaveCount(3);

      // close the view testee-1
      await routerPage.view.tab.click();
      await routerPage.enterPath('');
      await routerPage.enterTarget('testee-1');
      await routerPage.checkClose(true);
      await routerPage.clickNavigate();

      // expect the view testee-1 to be closed
      await expect(appPO.views()).toHaveCount(2);
      await expectView(testee1ViewPage).not.toBeAttached();
      await expectView(testee2ViewPage).toBeInactive();
    });

    test('should close multiple views by alternativeViewId', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Register perspective.
      const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
      await perspectivePage.registerPerspective({
        id: 'testee',
        parts: [
          {id: 'left'},
          {id: 'right', relativeTo: 'left', align: 'right'},
        ],
        views: [
          {id: 'test-router', partId: 'left', activateView: true},
          {id: 'testee-1', partId: 'right'},
          {id: 'testee-1', partId: 'right'},
          {id: 'testee-2', partId: 'right', activateView: true},
        ],
        navigateViews: [
          {id: 'test-router', commands: ['test-router']},
          {id: 'testee-1', commands: ['test-view']},
          {id: 'testee-2', commands: ['test-view']},
        ],
      });

      // Activate the perspective.
      await appPO.switchPerspective('testee');

      const routerPage = new RouterPagePO(appPO, {viewId: await appPO.resolveViewId('test-router')});
      const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'}); // testee-1
      const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'}); // testee-1
      const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'}); // testee-2

      // expect the test views to be opened
      await expect(appPO.views()).toHaveCount(4);

      // close the view testee-1
      await routerPage.enterPath('');
      await routerPage.enterTarget('testee-1');
      await routerPage.checkClose(true);
      await routerPage.clickNavigate();

      // expect the view testee-1 to be closed
      await expect(appPO.views()).toHaveCount(2);
      await expectView(testee1ViewPage).not.toBeAttached();
      await expectView(testee2ViewPage).not.toBeAttached();
      await expectView(testee3ViewPage).toBeActive();
    });
  });
});
