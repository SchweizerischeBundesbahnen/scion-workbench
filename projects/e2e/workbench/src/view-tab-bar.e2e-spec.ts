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

describe('ViewTabBar', () => {

  const appPO = new AppPO();
  const welcomePagePO = new WelcomePagePO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should not show if no views are open and no viewpart actions present', async () => {
    await browser.get('/#/?show-open-new-view-tab-action=false');

    await expect(appPO.getViewTabCount()).toEqual(0);
    await expect(appPO.isViewTabBarShowing()).toBeFalsy();

    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(appPO.getViewTabCount()).toEqual(1);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();

    await appPO.findViewTab('e2e-tile-view-1').close();
    await expect(appPO.getViewTabCount()).toEqual(0);
    await expect(appPO.isViewTabBarShowing()).toBeFalsy();

    await browser.get('/#/?show-open-new-view-tab-action=true');

    await expect(appPO.getViewTabCount()).toEqual(0);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();

    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(appPO.getViewTabCount()).toEqual(1);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();

    await appPO.findViewTab('e2e-tile-view-1').close();
    await expect(appPO.getViewTabCount()).toEqual(0);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
  });
});
