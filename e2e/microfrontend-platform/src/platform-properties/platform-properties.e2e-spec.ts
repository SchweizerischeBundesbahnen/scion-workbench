/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { TestingAppPO } from '../testing-app.po';
import { PlatformPropertiesPagePO } from './platform-properties-page.po';

describe('PlatformProperties', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should allow looking up platform properties from a microfrontend', async () => {
    const platformProperties = new Map().set('property1', 'value1').set('property2', 'value2');

    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet: {
        microfrontend1: PlatformPropertiesPagePO,
        microfrontend2: PlatformPropertiesPagePO,
      },
    }, {queryParams: platformProperties});

    const microfrontend1PO = pagePOs.get<PlatformPropertiesPagePO>('microfrontend1');
    await expect(microfrontend1PO.getPlatformProperties()).toEqual(new Map().set('property1', 'value1').set('property2', 'value2'));

    const microfrontend2PO = pagePOs.get<PlatformPropertiesPagePO>('microfrontend2');
    await expect(microfrontend2PO.getPlatformProperties()).toEqual(new Map().set('property1', 'value1').set('property2', 'value2'));
  });
});
