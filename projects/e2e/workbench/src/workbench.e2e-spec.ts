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
import { expectViewToShow } from './util/testing.util';

describe('Workbench', () => {

  const appPO = new AppPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should allow to always have an entry view open', async () => {
    await browser.get('/#/?ensure-welcome-view=true');

    await expect(appPO.getViewTabCount()).toEqual(1);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
    await expectViewToShow({viewCssClass: 'e2e-welcome-page', componentSelector: 'app-welcome-page'});

    // close the view
    await appPO.findViewTab('e2e-welcome-page').close();
    await expect(appPO.getViewTabCount()).toEqual(1);
    await expect(appPO.isViewTabBarShowing()).toBeTruthy();
    await expectViewToShow({viewCssClass: 'e2e-welcome-page', componentSelector: 'app-welcome-page'});
  });
});
