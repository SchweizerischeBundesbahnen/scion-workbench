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

describe('ViewPartAction', () => {

  const appPO = new AppPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should be added to all viewparts', async () => {
    const openNewTabActionButtonPO = appPO.findViewPartAction('e2e-open-new-tab');

    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
    await expect(openNewTabActionButtonPO.isPresent()).toBeTruthy();

    await browser.get('/#/?show-open-new-view-tab-action=false');
    await expect(appPO.isViewTabBarShowing()).toBeFalsy();
    await expect(openNewTabActionButtonPO.isPresent()).toBeFalsy();

    await browser.get('/#/?show-open-new-view-tab-action=true');
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
    await expect(openNewTabActionButtonPO.isPresent()).toBeTruthy();
  });

  it('should stick to a view if registered in the context of a view [testcase: 4a3a8932]', async () => {
    const welcomePagePO = new WelcomePagePO();
    const viewTabPO = appPO.findViewTab({cssClass: 'e2e-view-4a3a8932'});
    const viewLocalActionButtonPO = appPO.findViewPartAction('e2e-button-4a3a8932');

    await welcomePagePO.clickTile('e2e-tile-4a3a8932');

    // Open a view which contributes a view-local action
    await expect(viewTabPO.isActive()).toBeTruthy();
    await expect(viewLocalActionButtonPO.isPresent()).toBeTruthy();

    // Open a new view tab
    await appPO.openNewViewTab();
    await expect(viewLocalActionButtonPO.isPresent()).toBeFalsy();

    // Activate previous view
    await viewTabPO.click();
    await expect(viewLocalActionButtonPO.isPresent()).toBeTruthy();

    // Close the view
    await viewTabPO.close();
    await expect(viewTabPO.isPresent()).toBeFalsy();
    await expect(viewLocalActionButtonPO.isPresent()).toBeFalsy();
  });
});
