/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from './page-object/app.po';
import { browser } from 'protractor';
import { WelcomePagePO } from './page-object/welcome-page.po';
import { ViewNavigationPO } from './page-object/view-navigation.po';

describe('ViewTabBar', () => {

  const appPO = new AppPO();
  const welcomePagePO = new WelcomePagePO();
  const viewNavigationPO = new ViewNavigationPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should not show if no views are open and no viewpart actions present', async () => {
    await browser.get('/#/?show-open-new-view-tab-action=false');

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);

    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await appPO.findViewTab({cssClass: 'e2e-tile-view-1'}).close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);

    await browser.get('/#/?show-open-new-view-tab-action=true');

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);

    await appPO.findViewTab({cssClass: 'e2e-tile-view-1'}).close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);
  });

  it('should activate the most recent view when closing a view', async () => {
    await viewNavigationPO.navigateTo();
    await expect(await appPO.getViewTabCount()).toEqual(1);

    // open view-1
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-1', viewTitle: 'view-1'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-1'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // open view-2
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-2', viewTitle: 'view-2'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // open view-3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-3', viewTitle: 'view-3'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(4);

    // activate view-2
    await appPO.findViewTab({cssClass: 'e2e-view-2'}).click();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-2'}).isActive()).toBe(true);

    // activate view-1
    await appPO.findViewTab({cssClass: 'e2e-view-1'}).click();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-1'}).isActive()).toBe(true);

    // activate view-3
    await appPO.findViewTab({cssClass: 'e2e-view-3'}).click();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-3'}).isActive()).toBe(true);

    // close view-3
    await appPO.findViewTab({cssClass: 'e2e-view-3'}).close();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-1'}).isActive()).toBe(true);

    // close view-1
    await appPO.findViewTab({cssClass: 'e2e-view-1'}).close();

    await expect(await appPO.findViewTab({cssClass: 'e2e-view-2'}).isActive()).toBe(true);
  });

  it('should insert a new view tab into the tabbar after the active view tab by default', async () => {
    await viewNavigationPO.navigateTo();
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  it('should insert a new view tab into the tabbar at the end', async () => {
    await viewNavigationPO.navigateTo();
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('end');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('end');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2', 'view.3']);

    // open view.4
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('end');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);
  });

  it('should insert a new view tab into the tabbar at the start', async () => {
    await viewNavigationPO.navigateTo();
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('start');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.2', 'view.1']);

    // open view.3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('start');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.3', 'view.2', 'view.1']);

    // open view.4
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex('start');
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.4', 'view.3', 'view.2', 'view.1']);
  });

  it('should insert a new view tab into the tabbar at a custom position', async () => {
    await viewNavigationPO.navigateTo();
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.getViewTabs()).toEqual(['view.1']);

    // open view.2
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex(1);
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.2'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.2']);

    // open view.3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex(1);
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.3'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.checkActivateIfPresent(false);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.setInsertionIndex(1);
    await viewNavigationPO.navigate();

    await expect(await appPO.findViewTab({viewId: 'view.4'}).isActive()).toBe(true);
    await expect(await appPO.getViewTabs()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });
});
