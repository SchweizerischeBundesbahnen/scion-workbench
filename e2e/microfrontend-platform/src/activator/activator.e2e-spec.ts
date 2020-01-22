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

describe('Activator', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should activate applications on platform startup', async () => {
    const testingAppPO = new TestingAppPO();
    await testingAppPO.navigateTo({});

    const consolePanelPO = testingAppPO.consolePanelPO();
    await consolePanelPO.open();
    await expect(consolePanelPO.getLog(['onActivate'])).toEqual(jasmine.arrayWithExactContents([
        jasmine.objectContaining({type: 'onActivate', message: 'app-4200 [primary: true, X-APP-NAME: app-4200]'}),
        jasmine.objectContaining({type: 'onActivate', message: 'app-4200 [primary: false, X-APP-NAME: app-4200]'}),
        jasmine.objectContaining({type: 'onActivate', message: 'app-4201 [primary: true, X-APP-NAME: app-4201]'}),
        jasmine.objectContaining({type: 'onActivate', message: 'app-4202 [primary: true, X-APP-NAME: app-4202]'}),
        jasmine.objectContaining({type: 'onActivate', message: 'app-4203 [primary: true, X-APP-NAME: app-4203]'}),
      ],
    ));
  });
});
