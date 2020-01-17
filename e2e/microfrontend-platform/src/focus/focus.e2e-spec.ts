/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { TestingAppPO } from '../testing-app.po';
import { BrowserOutletPO } from '../browser-outlet/browser-outlet.po';
import { seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { Microfrontend1PagePO } from '../microfrontend/microfrontend-1-page.po';

describe('Focus', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should track the focus across microfrontends [This test only works if the browser window keeps the focus while executing the test, i.e. the browser window is the active window or the test runs headless.]', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: {
        outlet1a: Microfrontend1PagePO,
        outlet1b: Microfrontend1PagePO,
      },
      outlet2: {
        outlet2a: Microfrontend1PagePO,
        outlet2b: Microfrontend1PagePO,
      },
    });

    const outlet1 = pagePOs.get<BrowserOutletPO>('outlet1');
    const outlet1a = pagePOs.get<BrowserOutletPO>('outlet1a:outlet');
    const outlet1b = pagePOs.get<BrowserOutletPO>('outlet1b:outlet');
    const microfrontend1a = pagePOs.get<Microfrontend1PagePO>('outlet1a');
    const microfrontend1b = pagePOs.get<Microfrontend1PagePO>('outlet1b');

    const outlet2 = pagePOs.get<BrowserOutletPO>('outlet2');
    const outlet2a = pagePOs.get<BrowserOutletPO>('outlet2a:outlet');
    const outlet2b = pagePOs.get<BrowserOutletPO>('outlet2b:outlet');
    const microfrontend2a = pagePOs.get<Microfrontend1PagePO>('outlet2a');
    const microfrontend2b = pagePOs.get<Microfrontend1PagePO>('outlet2b');

    // Focus outlet 1 (contained in the root document)
    await outlet1.clickUrl();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeFalsy();
    await expect(outlet2.isFocusWithinIframe()).toBeFalsy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus outlet 1a
    await outlet1a.clickUrl();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeTruthy();
    await expect(outlet2.isFocusWithinIframe()).toBeFalsy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus outlet 2a
    await outlet2a.clickUrl();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeFalsy();
    await expect(outlet2.isFocusWithinIframe()).toBeTruthy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus outlet 1b
    await outlet1b.clickUrl();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeTruthy();
    await expect(outlet2.isFocusWithinIframe()).toBeFalsy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus outlet 2b
    await outlet2b.clickUrl();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeFalsy();
    await expect(outlet2.isFocusWithinIframe()).toBeTruthy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus microfrontend 1a
    await microfrontend1a.clickFragment();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeTruthy();
    await expect(outlet2.isFocusWithinIframe()).toBeFalsy();
    await expect(microfrontend1a.isFocusWithin()).toBeTruthy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus microfrontend 2a
    await microfrontend2a.clickFragment();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeFalsy();
    await expect(outlet2.isFocusWithinIframe()).toBeTruthy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeTruthy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus microfrontend 1b
    await microfrontend1b.clickFragment();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeTruthy();
    await expect(outlet2.isFocusWithinIframe()).toBeFalsy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeTruthy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeFalsy();

    // Focus microfrontend 2b
    await microfrontend2b.clickFragment();
    await expect(testingAppPO.isFocusWithin()).toBeTruthy();
    await expect(outlet1.isFocusWithinIframe()).toBeFalsy();
    await expect(outlet2.isFocusWithinIframe()).toBeTruthy();
    await expect(microfrontend1a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend1b.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2a.isFocusWithin()).toBeFalsy();
    await expect(microfrontend2b.isFocusWithin()).toBeTruthy();
  });
});

