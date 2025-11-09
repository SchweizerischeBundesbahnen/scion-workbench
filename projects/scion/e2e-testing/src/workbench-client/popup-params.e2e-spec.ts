/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {PopupPagePO} from './page-object/popup-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Popup', () => {

  test('should pass params to the popup component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-popup',
      },
    });

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterParams({id: '123'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect param to be available in the microfrontend.
    await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({id: '123'}));
  });

  test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg3', required: true},
        {name: 'mp1', required: true},
        {name: 'mp2', required: true},
        {name: 'qp1', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/popup-test-page/:seg1/segment2/:seg3;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
      },
    });

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterParams({seg1: 'SEG1', seg3: 'SEG3', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect named params to be substituted.
    await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({seg1: 'SEG1', seg3: 'SEG3', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'}));
    await expect.poll(() => popupPage.getRouteParams()).toEqual({segment1: 'SEG1', segment3: 'SEG3', mp1: 'MP1', mp2: 'MP2'});
    await expect.poll(() => popupPage.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect.poll(() => popupPage.getRouteFragment()).toEqual('FRAGMENT');
  });
});
