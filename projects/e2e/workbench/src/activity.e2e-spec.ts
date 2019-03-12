/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from './page-object/app.po';
import { browser } from 'protractor';

describe('Activity', () => {

  const appPO = new AppPO();

  describe('Activity bar', () => {

    it('should not show if no activities are registered [testcase: 1a90c8d3]', async () => {
      await browser.get('/');
      await expect(appPO.isActivityBarShowing()).toBeTruthy();

      await browser.get('/#/?show-activities=false');
      await expect(appPO.isActivityBarShowing()).toBeFalsy();

      await browser.get('/#/?show-activities=true');
      await expect(appPO.isActivityBarShowing()).toBeTruthy();
    });
  });
});
