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

test.describe('Workbench Router', () => {

  test('should match matrix params when resolving views for activation or closing', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);

    // open test view 1
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-1'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // open test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-2'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

    // open test view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-3'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);

    // activate test view 1
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-1'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);

    // activate test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-2'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);

    // activate test view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.view({cssClass: 'e2e-test-view-3'}).viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);

    // close test view 1
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

    // close test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // close test view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
  });

  test('should show title of inactive views when reloading the application', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open test view 1
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1', title: 'view-1-title', heading: 'view-1-heading'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    // open test view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2', title: 'view-2-title', heading: 'view-2-heading'});
    await routerPagePO.clickNavigateViaRouter();

    // reload the application
    await appPO.reload();

    const viewTab1 = appPO.view({cssClass: 'e2e-test-view-1'}).viewTab;
    await expect(await viewTab1.isActive()).toBe(false);
    await expect(await viewTab1.getTitle()).toEqual('view-1-title');
    await expect(await viewTab1.getHeading()).toEqual('view-1-heading');

    const viewTab2 = appPO.view({cssClass: 'e2e-test-view-2'}).viewTab;
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await viewTab2.getTitle()).toEqual('view-2-title');
    await expect(await viewTab2.getHeading()).toEqual('view-2-heading');

    await expect(consoleLogs.get({severity: 'error'})).toEqual([]);
  });

  test('should not throw outlet activation error when opening a new view tab once a view tab was closed', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart.getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(1);

    // close view tab
    await appPO.view({cssClass: 'e2e-start-page'}).viewTab.close();
    await expect(await appPO.activePart.getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(0);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart.getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(1);
    // expect no error to be thrown
    await expect(consoleLogs.get({severity: 'error'})).toEqual([]);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.activePart.getViewIds({cssClass: 'e2e-start-page'})).toHaveLength(2);

    // expect no error to be thrown
    await expect(consoleLogs.get({severity: 'error'})).toEqual([]);
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
    await appPO.activePart.closeViewTabs();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(0);

    // expect no error to be thrown
    await expect(consoleLogs.get({severity: 'error'})).toEqual([]);
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
    await expect(await appPO.activePart.getViewIds()).toHaveLength(10);

    // close all test views via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
  });

  test('should allow closing a view matching specified matrix params via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-1'});
    await routerPagePO.clickNavigateViaRouter();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-2'});
    await routerPagePO.clickNavigateViaRouter();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-3'});
    await routerPagePO.clickNavigateViaRouter();

    // expect the test views to be opened
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);

    // close the view with CSS class 'testee-2'
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-navigation');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-2'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    // expect the test view to be closed
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(true);
    expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow opening a view in a new view tab [target=blank]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened as new tab
    await expect(await testeeViewPO.viewTab.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // expect the test view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.activeView.getViewId()).toEqual(testeeViewId);
  });

  test('should allow opening a view in the current view tab [target=self]', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened in the same tab
    await expect(await testeeViewPO.viewTab.getViewId()).toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);

    // expect the test view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.activeView.getViewId()).toEqual(testeeViewId);
  });

  test('should, by default, not activate a present view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    const testee1ViewId = await appPO.activePart.activeView.getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(testee1ViewId).not.toEqual(routerViewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

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
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    const testee2ViewId = await appPO.activePart.activeView.getViewId();
    const testee2ViewPO = appPO.view({viewId: testee2ViewId});

    // expect a new test view to be opened
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewPO.viewTab.isActive()).toBe(true);
    await expect(await testee2ViewPO.isPresent()).toBe(true);
  });

  test('should activate a present view if setting `checkActivateIfPresent` to `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the view to be opened as new tab
    await expect(await testeeViewPO.viewTab.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // expect the view to be opened
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the view to be the active view
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart.activeView.getViewId()).toEqual(testeeViewId);

    // activate the router view
    await routerPagePO.viewTabPO.click();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isActive()).toBe(false);

    // activate the view via routing
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.checkActivateIfPresent(true); // activate the view if present
    await routerPagePO.clickNavigateViaRouter();

    // expect the view to be activated and no new view to be opened
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await testeeViewPO.viewTab.isActive()).toBe(true);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(true);
  });

  test('should not activate a present view if setting `checkActivateIfPresent` to `false`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const routerViewId = await routerPagePO.viewPO.getViewId();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    const testee1ViewId = await appPO.activePart.activeView.getViewId();
    const testee1ViewPO = appPO.view({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(await testee1ViewPO.viewTab.getViewId()).not.toEqual(routerViewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

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
    await routerPagePO.selectTarget('blank');
    await routerPagePO.checkActivateIfPresent(false); // do not activate the view if present
    await routerPagePO.clickNavigateViaRouter();

    const testee2ViewId = await appPO.activePart.activeView.getViewId();
    const testee2ViewPO = appPO.view({viewId: testee2ViewId});

    // expect a new test view to be opened
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.viewTab.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewPO.viewTab.isActive()).toBe(true);
    await expect(await testee2ViewPO.isPresent()).toBe(true);
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

  test('should allow setting view title via "wb.title" matrix param (DEPRECATED: API will be removed in v16)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({'wb.title': 'testee'}); // deprecated API
    await routerPagePO.enterCssClass('e2e-test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    const viewTab = appPO.view({cssClass: 'e2e-test-view'}).viewTab;
    await expect(await viewTab.getTitle()).toEqual('testee');
  });

  test('should allow setting view heading via "wb.heading" matrix param (DEPRECATED: API will be removed in v16)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({'wb.heading': 'testee'}); // deprecated API
    await routerPagePO.enterCssClass('e2e-test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    const viewTab = appPO.view({cssClass: 'e2e-test-view'}).viewTab;
    await expect(await viewTab.getHeading()).toEqual('testee');
  });

  test('should allow setting CSS class(es) via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const activeViewPO = await appPO.activePart.activeView;

    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('e2e-test-view');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await activeViewPO.getCssClasses()).toEqual(expect.arrayContaining(['e2e-test-view']));
    await expect(await activeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['e2e-test-view']));
  });
});
