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

test.describe('Workbench Router', () => {

  test('should ignore matrix params when resolving views for activation', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);

    // open test view 1
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view', param: '1'});
    await routerPagePO.checkActivate(true);
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // open test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view', param: '2'});
    await routerPagePO.checkActivate(true);
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // open test view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view', param: '3'});
    await routerPagePO.checkActivate(true);
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
  });

  test('should ignore matrix params when resolving views for closing', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);

    // open test view 1
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view-1'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // open test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view-2'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // open test view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    await expect(await appPO.view({cssClass: 'e2e-test-view-3'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close all test views
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});  // matrix param is ignored when closing views
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should show title of inactive views when reloading the application', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open test view 1
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1', title: 'view-1-title'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // open test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2', title: 'view-2-title'});
    await routerPagePO.clickNavigate();

    // reload the application
    await appPO.reload();

    const viewTab1 = appPO.view({cssClass: 'e2e-test-view-1'}).viewTab;
    await expect(await viewTab1.isActive()).toBe(false);
    await expect(await viewTab1.getTitle()).toEqual('view-1-title');

    const viewTab2 = appPO.view({cssClass: 'e2e-test-view-2'}).viewTab;
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await viewTab2.getTitle()).toEqual('view-2-title');

    await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);
  });

  test('should not throw outlet activation error when opening a new view tab once a view tab was closed', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(1);

    // close view tab
    await appPO.view({cssClass: 'e2e-start-page'}).viewTab.close();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(0);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(1);
    // expect no error to be thrown
    await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(2);

    // expect no error to be thrown
    await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);
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

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);

    // expect no error to be thrown
    await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);
  });

  test('should allow closing multiple views via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

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
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(10);

    // close all test views via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should allow closing a single view by viewId via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();
    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the view 1
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the view 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
  });

  test('should ignore closing a view with an unknown viewId via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the unknown view 99
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget('view.99');
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect no view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
  });

  test('should reject closing a view by viewId via router if a path is also given', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();
    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // try closing view by providing viewId and path
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.checkClose(true);

    // expect closing to be rejected
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]\[IllegalArgumentError]/);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views with the path 'test-pages/navigation-test-page'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views with the path 'test-pages/navigation-test-page/1'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views with the path 'test-pages/navigation-test-page/*'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/*');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/1/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-5');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-6');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(7);

    // close the views with the path 'test-pages/navigation-test-page/1/1'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/1');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(6);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-5'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-6'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*/1` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-5');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-6');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(7);

    // close the views with the path 'test-pages/navigation-test-page/*/1'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/*/1');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-5'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-6'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views matching the path `test-pages/navigation-test-page/*/*` via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/1/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-5');
    await routerPagePO.clickNavigate();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/2/2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-6');
    await routerPagePO.clickNavigate();

    // expect the test views to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(7);

    // close the views with the path 'test-pages/navigation-test-page/*/*'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-pages/navigation-test-page/*/*');
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the test view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-5'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-6'}).viewTab.isPresent()).toBe(false);
  });

  test('should allow opening a view in a new view tab [target=blank]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened as new tab
    await expect(await testeeViewPO.viewTab.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).activeView.getViewId()).toEqual(testeeViewId);
  });

  test('should allow opening a view in the current view tab [target=viewId]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewId = routerPagePO.viewId;

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened in the same tab
    await expect(await testeeViewPO.viewTab.getViewId()).toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);

    // expect the test view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).activeView.getViewId()).toEqual(testeeViewId);
  });

  test('should open a new view instead of activating a present view [target=blank]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);

    // activate the router test view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);

    // navigate to a new test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee2ViewPO = appPO.view({viewId: testee2ViewId});

    // expect a new test view to be opened
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewPO.viewTab.isActive()).toBe(true);
    await expect(await testee2ViewPO.isPresent()).toBe(true);
  });

  test('should activate a present view if setting `checkActivate` to `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the view to be opened as new tab
    await expect(await testeeViewPO.viewTab.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).activeView.getViewId()).toEqual(testeeViewId);

    // activate the router view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isActive()).toBe(false);

    // activate the view via routing
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.checkActivate(true);
    await routerPagePO.clickNavigate();

    // expect the view to be activated and no new view to be opened
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(true);
  });

  test('should not activate a new view if set `activate` to `false`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.checkActivate(true); // activate the view
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee1ViewPO = appPO.view({cssClass: 'testee-1'});
    const testee1ViewId = await testee1ViewPO.getViewId();

    // expect the test view to be opened as new tab
    await expect(await testee1ViewPO.viewTab.getViewId()).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);

    // activate the router test view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);

    // navigate to a new test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.checkActivate(false); // do not activate the view
    await routerPagePO.clickNavigate();

    const testee2ViewPO = appPO.view({cssClass: 'testee-2'});
    const testee2ViewId = await testee2ViewPO.getViewId();

    // expect a new test view to be opened but not to be activated
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewPO.viewTab.isActive()).toBe(false);
    await expect(await testee2ViewPO.isPresent()).toBe(false);
  });

  test('should not destroy the component of the view when it is inactivated', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    const componentInstanceId = await viewPagePO.getComponentInstanceId();

    // activate the router test view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO.viewTabPO.isActive()).toBe(false);

    // activate the test view
    await viewPagePO.viewTabPO.click();
    await expect(await viewPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);

    // expect the component not to be constructed anew
    await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should allow setting CSS class(es) via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const activeViewPO = await appPO.activePart({inMainArea: true}).activeView;

    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('e2e-test-view');
    await routerPagePO.clickNavigate();

    await expect(await activeViewPO.getCssClasses()).toEqual(expect.arrayContaining(['e2e-test-view']));
    await expect(await activeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['e2e-test-view']));
  });

  test('should open a new view if no present view can be found [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);
  });

  test('should navigate existing view(s) of the same path (path matches single view) [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);

    // activate the router test view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);

    // navigate to a present view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();

    // expect the present view to be activated
    await expect(testee1ViewId).toEqual(testee2ViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);
  });

  test('should navigate existing view(s) of the same path (path matches multiple views) [target=auto]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view 1
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterMatrixParams({param: 'value1'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();
    const testee1ViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testee1ViewPagePO = new ViewPagePO(appPO, testee1ViewId);

    // expect the param to be set
    await expect(await testee1ViewPagePO.getRouteParams()).toEqual({param: 'value1'});

    // activate the router test view
    await routerPagePO.viewTabPO.click();

    // navigate to the test view 2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterMatrixParams({param: 'value1'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.view({cssClass: 'testee-2'}).getViewId();
    const testee2ViewPagePO = new ViewPagePO(appPO, testee2ViewId);

    // expect the param to be set
    await expect(await testee2ViewPagePO.getRouteParams()).toEqual({param: 'value1'});

    // activate the router test view
    await routerPagePO.viewTabPO.click();

    // update all matching present views
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterMatrixParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect the present views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await testee1ViewPagePO.viewTabPO.click();
    await expect(await testee1ViewPagePO.getRouteParams()).toEqual({param: 'value2'});
    await testee2ViewPagePO.viewTabPO.click();
    await expect(await testee2ViewPagePO.getRouteParams()).toEqual({param: 'value2'});
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);
  });

  test('should, by default, navigate existing view(s) of the same path (path matches single view) [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testee1ViewPO = new ViewPagePO(appPO, testee1ViewId);

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTabPO.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTabPO.isActive()).toBe(true);

    // activate the router test view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.viewTabPO.isActive()).toBe(false);

    // navigate to a present view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(''); // will be interpreted as undefined
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();

    // expect the present view to be activated
    await expect(testee1ViewId).toEqual(testee2ViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // navigate to a present view updating its matrix params
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(''); // will be interpreted as undefined
    await routerPagePO.enterMatrixParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    const testee3ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();

    // expect the present view to be updated
    await expect(testee1ViewId).toEqual(testee3ViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);
    await expect(await testee1ViewPO.getRouteParams()).toEqual({param: 'value1'});
  });

  test('should, by default, navigate existing view(s) of the same path (path matches multiple views) [target=`undefined`]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view 1
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterMatrixParams({param: 'value1'});
    await routerPagePO.clickNavigate();
    const testee1ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee1ViewPagePO = new ViewPagePO(appPO, testee1ViewId);

    // expect the param to be set
    await expect(await testee1ViewPagePO.getRouteParams()).toEqual({param: 'value1'});

    // activate the router test view
    await routerPagePO.viewTabPO.click();

    // navigate to the test view 2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterMatrixParams({param: 'value1'});
    await routerPagePO.clickNavigate();
    const testee2ViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const testee2ViewPagePO = new ViewPagePO(appPO, testee2ViewId);

    // expect the param to be set
    await expect(await testee2ViewPagePO.getRouteParams()).toEqual({param: 'value1'});

    // activate the router test view
    await routerPagePO.viewTabPO.click();

    // update all matching present views
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('');
    await routerPagePO.enterMatrixParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect the present views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await testee1ViewPagePO.viewTabPO.click();
    await expect(await testee1ViewPagePO.getRouteParams()).toEqual({param: 'value2'});
    await testee2ViewPagePO.viewTabPO.click();
    await expect(await testee2ViewPagePO.getRouteParams()).toEqual({param: 'value2'});
  });

  test('should open a new view if the target view is not found [target=viewId]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewId = 'view.new';
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    const testee1ViewPO = appPO.view({viewId});

    // expect the test view to be opened as new tab
    await expect(viewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testee1ViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(true);
  });

  test('should support app URL to contain view outlets of views in the workbench grid', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Define perspective with a part on the left.
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId: 'perspective'});
    await perspectiveToggleButtonPO.click();
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {align: 'left', ratio: .25});

    // Add view to the left part in the workbench grid.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterBlankPartId('left');
    await routerPagePO.clickNavigate();

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
          id: await layoutPagePO.viewPO.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPagePO.viewPO.part.getPartId(),
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
          id: await layoutPagePO.viewPO.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPagePO.viewPO.part.getPartId(),
      },
    });

    // Expect the test view to display.
    await expect(new ViewPagePO(appPO, 'view.3').locator).toBeVisible();
  });

  test('should allow for navigation to an empty path auxiliary route in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Define perspective with a part on the left.
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId: 'perspective'});
    await perspectiveToggleButtonPO.click();
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {align: 'left', ratio: .25});

    // Register auxiliary route.
    await layoutPagePO.registerRoute({path: '', outlet: 'testee', component: 'view-page'});

    // Open view in the left part.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget('testee');
    await routerPagePO.enterBlankPartId('left');
    await routerPagePO.clickNavigate();

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
          id: await layoutPagePO.viewPO.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}], // layout page, router page
          activeViewId: 'view.2',
        }),
        activePartId: await layoutPagePO.viewPO.part.getPartId(),
      },
    });

    // Expect the view to display.
    await expect(new ViewPagePO(appPO, 'testee').locator).toBeVisible();
  });

  test('should allow for navigation to an empty path auxiliary route in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register auxiliary route.
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.registerRoute({path: '', outlet: 'testee', component: 'view-page'});

    // Open view in the left part.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget('testee');
    await routerPagePO.clickNavigate();

    // Expect the view to be opened in the left part.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          id: await layoutPagePO.viewPO.part.getPartId(),
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'testee'}], // layout page, router page, testee view
          activeViewId: 'testee',
        }),
        activePartId: await layoutPagePO.viewPO.part.getPartId(),
      },
    });

    // Expect the view to display.
    await expect(new ViewPagePO(appPO, 'testee').locator).toBeVisible();
  });
});
