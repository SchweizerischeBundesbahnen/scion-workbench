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
import {StartPagePO} from '../start-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('View Tabbar', () => {

  test('should not show if no views are open and no viewpart actions present', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, showNewTabAction: false});
    const startPagePO = new StartPagePO(appPO);

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);

    await startPagePO.openWorkbenchView('e2e-test-view');
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await appPO.findViewTab({cssClass: 'e2e-test-view'}).close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);

    await appPO.navigateTo({microfrontendSupport: false, showNewTabAction: true});

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await startPagePO.openWorkbenchView('e2e-test-view');
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await appPO.findViewTab({cssClass: 'e2e-test-view'}).close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);
  });

  test('should activate the most recent view when closing a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await expect(await appPO.getViewTabCount()).toEqual(1);

    // open view-1
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // open view-2
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // open view-3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-3'});
    await routerPagePO.checkActivateIfPresent(true);
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // activate view-2
    await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).activate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).isActive()).toBe(true);

    // activate view-1
    await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).activate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).isActive()).toBe(true);

    // activate view-3
    await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).activate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).isActive()).toBe(true);

    // close view-3
    await appPO.findViewTab({cssClass: 'e2e-test-view-3'}).close();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).isActive()).toBe(true);

    // close view-1
    await appPO.findViewTab({cssClass: 'e2e-test-view-1'}).close();

    await expect(await appPO.findViewTab({cssClass: 'e2e-test-view-2'}).isActive()).toBe(true);
  });

  test('should insert a new view tab into the tabbar after the active view tab by default', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  test('should insert a new view tab into the tabbar at the end', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('end');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('end');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2', 'view.3']);

    // open view.4
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('end');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);
  });

  test('should insert a new view tab into the tabbar at the start', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('start');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.2', 'view.1']);

    // open view.3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('start');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.3', 'view.2', 'view.1']);

    // open view.4
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex('start');
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.4', 'view.3', 'view.2', 'view.1']);
  });

  test('should insert a new view tab into the tabbar at a custom position', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex(1);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex(1);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.enterInsertionIndex(1);
    await routerPagePO.clickNavigateViaRouter();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  test('should allow to have a sticky view tab', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, stickyStartViewTab: true});
    const startPagePO = new StartPagePO(appPO);

    // expect the sticky view to be opened
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.findViewTab({cssClass: 'e2e-start-page'}).isPresent()).toBe(true);
    await expect(await startPagePO.isPresent()).toBe(true);

    // close the sticky view
    await appPO.findViewTab({cssClass: 'e2e-start-page'}).close();

    // expect the sticky view to be opened
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.findViewTab({cssClass: 'e2e-start-page'}).isPresent()).toBe(true);
    await expect(await startPagePO.isPresent()).toBe(true);
  });
});
