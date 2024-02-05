/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Workbench Popup Capability', () => {

  test(`should provide the popup's capability`, async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(appPO, popup);

    // expect the popup of this app to display
    await expect.poll(() => popupPage.getPopupCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee'},
      type: 'popup',
      properties: expect.objectContaining({
        path: 'test-popup',
      }),
    }));
  });

  test('should error if qualifier is missing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: undefined!,
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if qualifier is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {},
      properties: {
        path: 'test-pages/microfrontend-test-page',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullQualifierError/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<null>',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/NullPathError/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '',
      },
    });
    expect(registeredCapability.properties.path).toEqual('');
  });
});
