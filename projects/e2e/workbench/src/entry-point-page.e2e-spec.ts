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
import { MAIN_PART_ID } from '@scion/workbench/core';

describe('Entry point page', () => {

  const appPO = new AppPO();
  const welcomePagePO = new WelcomePagePO();

  beforeEach(async () => {
    await browser.get('/#/?show-open-new-view-tab-action=false');

  });

  it('should be displayed if no view is showing', async () => {
    await expect(appPO.isEntryPointPageShowing('app-welcome-page')).toBeTruthy();
    await expect(welcomePagePO.isPresent()).toBeTruthy();
    await expect(appPO.isViewTabBarShowing()).toBeFalsy();

    // Open a view
    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(appPO.isEntryPointPageShowing('app-welcome-page')).toBeFalsy();
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
    await expect(welcomePagePO.isPresent()).toBeFalsy();
    await expect(appPO.findViewTab(MAIN_PART_ID, {cssClass: 'e2e-tile-view-1'}).isPresent).toBeTruthy();

    // Close the view
    await appPO.findViewTab(MAIN_PART_ID, {cssClass: 'e2e-tile-view-1'}).close();
    await expect(appPO.isEntryPointPageShowing('app-welcome-page')).toBeTruthy();
    await expect(welcomePagePO.isPresent()).toBeTruthy();
    await expect(appPO.isViewTabBarShowing()).toBeFalsy();
  });
});
