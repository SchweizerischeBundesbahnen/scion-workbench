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
import { TestcaseB8bbbb11ViewPO } from './page-object/testcase-b8bbbb11-view.po';
import { TestingViewPO } from './page-object/testing-view.po';
import { HostAppPO } from './page-object/host-app.po';

describe('RouterLink', () => {

  const hostAppPO = new HostAppPO();
  const testingViewPO = new TestingViewPO();
  const viewPO = new TestcaseB8bbbb11ViewPO();

  beforeEach(async () => {
    await browser.get('/');
    await testingViewPO.navigateTo();
    const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
    await viewNavigationPO.enterQualifier({
      entity: 'testing',
      testcase: 'b8bbbb11-view',
    });
    await viewNavigationPO.selectTarget('self');
    await viewNavigationPO.execute();
  });

  it('should open testing view in current view [testcase: b8bbbb11-view]', async () => {
    await viewPO.clickLink();
    await expect(hostAppPO.getViewTabCount('viewpart.1')).toBe(1);
  });

  it('should open testing view in new view tab when CTRL + click [testcase: b8bbbb11-view]', async () => {
    await viewPO.clickLink(Key.CONTROL);
    await expect(hostAppPO.getViewTabCount('viewpart.1')).toBe(2);
  });

  it('should open testing view in new view tab when COMMAND + click [testcase: b8bbbb11-view]', async () => {
    await viewPO.clickLink(Key.COMMAND);
    await expect(hostAppPO.getViewTabCount('viewpart.1')).toBe(2);
  });

  it('should open testing view in new view tab when META + click [testcase: b8bbbb11-view]', async () => {
    await viewPO.clickLink(Key.META);
    await expect(hostAppPO.getViewTabCount('viewpart.1')).toBe(2);
  });
});
