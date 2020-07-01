/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestingViewPO } from './page-object/testing-view.po';
import { browser } from 'protractor';

describe('CustomIntent', () => {
  const testingViewPO = new TestingViewPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should return result when custom intent is dispatched', async () => {
    await testingViewPO.navigateTo();
    const panelPO = await testingViewPO.openPingIntentPanel();

    await panelPO.enterPingMessage('Nobody calls me chicken!');
    await panelPO.clickPingButton();
    await expect(panelPO.getResult()).toEqual('Nobody calls me chicken!');
  });
});
