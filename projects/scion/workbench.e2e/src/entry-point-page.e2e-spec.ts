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

describe('Default view', () => {

  const appPO = new AppPO();
  const welcomePagePO = new WelcomePagePO();

  beforeEach(async () => {
    await browser.get('/#/?show-open-new-view-tab-action=false');

  });

  it('should be displayed if there is no view opened', async () => {
    await expect(await appPO.isDefaultPageShowing('app-welcome-page')).toBe(true);
    await expect(await welcomePagePO.isPresent()).toBe(true);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);

    // Open a view
    await welcomePagePO.clickTile('e2e-tile-view-1');
    await expect(await appPO.isDefaultPageShowing('app-welcome-page')).toBe(false);
    await expect(await appPO.isViewTabBarShowing()).toBe(true);
    await expect(await welcomePagePO.isPresent()).toBe(false);
    await expect(await appPO.findViewTab({cssClass: 'e2e-tile-view-1'}).isPresent()).toBe(true);

    // Close the view
    await appPO.findViewTab({cssClass: 'e2e-tile-view-1'}).close();
    await expect(await appPO.isDefaultPageShowing('app-welcome-page')).toBe(true);
    await expect(await welcomePagePO.isPresent()).toBe(true);
    await expect(await appPO.isViewTabBarShowing()).toBe(false);
  });
});
