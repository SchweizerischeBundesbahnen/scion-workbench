/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { browser, Key } from 'protractor';
import { TestcaseBb9700a6ViewPO } from './page-object/testcase-bb9700a6-view.po';
import { AppPO } from './page-object/app.po';
import { ViewNavigationPO } from './page-object/view-navigation.po';
import { MAIN_PART_ID } from '@scion/workbench/core';

describe('RouterLink', () => {

  const appPO = new AppPO();
  const viewNavigationPO = new ViewNavigationPO();
  const viewPO = new TestcaseBb9700a6ViewPO();

  beforeEach(async () => {
    await browser.get('/');
    await viewNavigationPO.navigateTo();

    // open view-bb9700a6
    await viewNavigationPO.enterPath('view-bb9700a6');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-bb9700a6', viewTitle: 'view-bb9700a6'});
    await viewNavigationPO.selectTarget('self');
    await viewNavigationPO.navigate();
  });

  it('should open the testing view in current view [testcase: bb9700a6-view]', async () => {
    await viewPO.clickLink();
    await expect(appPO.getViewTabCount(MAIN_PART_ID)).toBe(1);
  });

  it('should open the testing view in new view tab when CTRL + click [testcase: bb9700a6-view]', async () => {
    await viewPO.clickLink(Key.CONTROL);
    await expect(appPO.getViewTabCount(MAIN_PART_ID)).toBe(2);
  });

  it('should open the testing view in new view tab when COMMAND + click [testcase: bb9700a6-view]', async () => {
    await viewPO.clickLink(Key.COMMAND);
    await expect(appPO.getViewTabCount(MAIN_PART_ID)).toBe(2);
  });

  it('should open the testing view in new view tab when META + click [testcase: bb9700a6-view]', async () => {
    await viewPO.clickLink(Key.META);
    await expect(appPO.getViewTabCount(MAIN_PART_ID)).toBe(2);
  });
});
