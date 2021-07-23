/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {RouterPagePO} from './page-object/router-page.po';
import {consumeBrowserLog} from '../helper/testing.util';
import {ViewPagePO} from './page-object/view-page.po';
import {logging} from 'protractor';
import Level = logging.Level;

describe('Workbench Router', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should match matrix params when resolving views for activation or closing', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();
    await expect(await appPO.getViewTabCount()).toEqual(1);

    // open test view 1
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // open test view 2
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // open test view 3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // activate test view 1
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // activate test view 2
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // activate test view 3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // close test view 1
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // close test view 2
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // close test view 3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);
  });

  it('should show title of inactive views when reloading the application', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // open test view 1
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1', title: 'view-1-title', heading: 'view-1-heading'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    // open test view 2
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2', title: 'view-2-title', heading: 'view-2-heading'});
    await routerPagePO.clickNavigateViaRouter();

    // reload the application
    await appPO.reload();

    const viewTab1 = await appPO.findViewTab({cssClass: 'e2e-test-view-1'});
    await expect(await viewTab1.isActive()).toBe(false);
    await expect(await viewTab1.getTitle()).toEqual('view-1-title');
    await expect(await viewTab1.getHeading()).toEqual('view-1-heading');

    const viewTab2 = appPO.findViewTab({cssClass: 'e2e-test-view-2'});
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await viewTab2.getTitle()).toEqual('view-2-title');
    await expect(await viewTab2.getHeading()).toEqual('view-2-heading');

    await expect(await consumeBrowserLog(Level.SEVERE)).toEqual([]);
  });

  it('should not throw outlet activation error when opening a new view tab once a view tab was closed', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.getViewTabCount({viewCssClass: 'e2e-start-page'})).toEqual(1);

    // close view tab
    await appPO.findViewTab({cssClass: 'e2e-start-page'}).close();
    await expect(await appPO.getViewTabCount({viewCssClass: 'e2e-start-page'})).toEqual(0);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.getViewTabCount({viewCssClass: 'e2e-start-page'})).toEqual(1);
    // expect no error to be thrown
    await expect(await consumeBrowserLog(Level.SEVERE)).toEqual([]);

    // open view tab
    await appPO.openNewViewTab();
    await expect(await appPO.getViewTabCount({viewCssClass: 'e2e-start-page'})).toEqual(2);

    // expect no error to be thrown
    await expect(await consumeBrowserLog(Level.SEVERE)).toEqual([]);
  });

  it('should allow closing all views by pressing CTRL+ALT+SHIFT+K keystroke', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open multiple test view tabs
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();

    // close all view tabs
    await appPO.closeAllViewTabs();

    await expect(await appPO.getViewTabCount()).toEqual(0);

    // expect no error to be thrown
    await expect(await consumeBrowserLog(Level.SEVERE)).toEqual([]);
  });

  it('should allow closing multiple views via router', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // open multiple test view tabs
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();
    await ViewPagePO.openInNewTab();

    // expect the test views to be opened
    await expect(await appPO.getViewTabCount()).toEqual(10);

    // close all test views via router
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.getViewTabCount()).toEqual(1);
  });

  it('should allow closing a specific view via router', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-1'});
    await routerPagePO.clickNavigateViaRouter();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-2'});
    await routerPagePO.clickNavigateViaRouter();

    // open the test view in a new view tab
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-3'});
    await routerPagePO.clickNavigateViaRouter();

    // expect the test views to be opened
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // close the view with CSS class 'testee-2'
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee-2'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigateViaRouter();

    // expect the test view to be closed
    await expect(await appPO.getViewTabCount()).toEqual(3);
    expect(await appPO.findViewTab({cssClass: 'testee-1'}).isPresent()).toBe(true);
    expect(await appPO.findViewTab({cssClass: 'testee-2'}).isPresent()).toBe(false);
    expect(await appPO.findViewTab({cssClass: 'testee-3'}).isPresent()).toBe(true);
  });

  it('should allow opening a view in a new view tab [target=blank]', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened as new tab
    await expect(await testeeViewTabPO.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // expect the test view to be opened
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.findActiveView().getViewId()).toEqual(testeeViewId);
  });

  it('should allow opening a view in the current view tab [target=self]', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the test view to be opened in the same tab
    await expect(await testeeViewTabPO.getViewId()).toEqual(routerPagePO.viewId);
    await expect(await appPO.getViewTabCount()).toEqual(1);

    // expect the test view to be opened
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.findActiveView().getViewId()).toEqual(testeeViewId);
  });

  it('should, by default, not activate a present view ', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();
    const routerViewId = await routerPagePO.viewPO.getViewId();
    const activeViewTabPO = appPO.findActiveViewTab();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testee1ViewId = await activeViewTabPO.getViewId();
    const testee1ViewTabPO = appPO.findViewTab({viewId: testee1ViewId});
    const testee1ViewPO = appPO.findView({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(await testee1ViewTabPO.getViewId()).not.toEqual(routerViewId);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // expect the test view to be opened
    await expect(await testee1ViewTabPO.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewTabPO.isActive()).toBe(true);
    await expect(await activeViewTabPO.getViewId()).toEqual(testee1ViewId);

    // activate the router test view
    await routerPagePO.viewTabPO.activate();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewTabPO.isActive()).toBe(false);

    // navigate to a new test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testee2ViewId = await activeViewTabPO.getViewId();
    const testee2ViewTabPO = appPO.findViewTab({viewId: testee2ViewId});
    const testee2ViewPO = appPO.findView({viewId: testee2ViewId});

    // expect a new test view to be opened
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await activeViewTabPO.getViewId()).toEqual(testee2ViewId);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewTabPO.isActive()).toBe(true);
    await expect(await testee2ViewPO.isPresent()).toBe(true);
  });

  it('should activate a present view if setting  `checkActivateIfPresent` to `true`', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    const testeeViewId = await testeeViewPO.getViewId();

    // expect the view to be opened as new tab
    await expect(await testeeViewTabPO.getViewId()).not.toEqual(routerPagePO.viewId);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // expect the view to be opened
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewPO.isPresent()).toBe(true);

    // expect the view to be the active view
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.findActiveView().getViewId()).toEqual(testeeViewId);

    // activate the router view
    await routerPagePO.viewTabPO.activate();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewTabPO.isActive()).toBe(false);

    // activate the view via routing
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.checkActivateIfPresent(true); // activate the view if present
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    // expect the view to be activated and no new view to be opened
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(true);
  });

  it('should not activate a present view if setting  `checkActivateIfPresent` to `false`', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();
    const routerViewId = await routerPagePO.viewPO.getViewId();
    const activeViewTabPO = appPO.findActiveViewTab();

    // navigate to the test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testee1ViewId = await activeViewTabPO.getViewId();
    const testee1ViewTabPO = appPO.findViewTab({viewId: testee1ViewId});
    const testee1ViewPO = appPO.findView({viewId: testee1ViewId});

    // expect the test view to be opened as new tab
    await expect(await testee1ViewTabPO.getViewId()).not.toEqual(routerViewId);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // expect the test view to be opened
    await expect(await testee1ViewTabPO.isPresent()).toBe(true);
    await expect(await testee1ViewPO.isPresent()).toBe(true);

    // expect the test view to be the active view
    await expect(await testee1ViewTabPO.isActive()).toBe(true);
    await expect(await activeViewTabPO.getViewId()).toEqual(testee1ViewId);

    // activate the router test view
    await routerPagePO.viewTabPO.activate();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewTabPO.isActive()).toBe(false);

    // navigate to a new test view
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.checkActivateIfPresent(false); // do not activate the view if present
    await routerPagePO.enterMatrixParams({cssClass: 'testee'});
    await routerPagePO.clickNavigateViaRouter();

    const testee2ViewId = await activeViewTabPO.getViewId();
    const testee2ViewTabPO = appPO.findViewTab({viewId: testee2ViewId});
    const testee2ViewPO = appPO.findView({viewId: testee2ViewId});

    // expect a new test view to be opened
    await expect(testee1ViewId).not.toEqual(testee2ViewId);
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await activeViewTabPO.getViewId()).toEqual(testee2ViewId);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewTabPO.isActive()).toBe(false);
    await expect(await testee1ViewPO.isPresent()).toBe(false);
    await expect(await testee2ViewTabPO.isActive()).toBe(true);
    await expect(await testee2ViewPO.isPresent()).toBe(true);
  });

  it('should not destroy the component of the view when it is inactivated', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPagePO = await RouterPagePO.openInNewTab();
    const viewPagePO = await ViewPagePO.openInNewTab();

    const componentInstanceId = await viewPagePO.getComponentInstanceId();

    // activate the router test view
    await routerPagePO.viewTabPO.activate();
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO.viewTabPO.isActive()).toBe(false);

    // activate the test view
    await viewPagePO.viewTabPO.activate();
    await expect(await viewPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(false);

    // expect the component not to be constructed anew
    await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
  });
});
