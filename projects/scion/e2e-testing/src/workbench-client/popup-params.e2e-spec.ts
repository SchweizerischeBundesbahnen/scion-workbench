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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Popup', () => {

  test('should allow passing a value to the popup component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {entity: 'product'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({entity: 'product'});
    await popupOpenerPage.enterParams({id: '123'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect qualifier to be contained in popup params
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPopupParams()).toEqual(expect.objectContaining({entity: 'product', id: '123'}));
  });

  test('should contain the qualifier in popup params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {entity: 'products'},
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({entity: 'products'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect qualifier to be contained in popup params
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPopupParams()).toEqual(expect.objectContaining({entity: 'products'}));
  });

  test('should not overwrite qualifier values with param values', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {entity: 'product', mode: 'new'},
      params: [
        {name: 'mode', required: true},
      ],
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({entity: 'product', mode: 'new'});
    await popupOpenerPage.enterParams({mode: 'edit'}); // should be ignored
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect qualifier values not to be overwritten by params
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPopupParams()).toEqual(expect.objectContaining({entity: 'product', mode: 'new'}));
  });

  test('should substitute named URL params with values of the qualifier and params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'},
      params: [
        {name: 'seg3', required: true},
        {name: 'mp2', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/popup-test-page/:seg1/segment2/:seg3;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'});
    await popupOpenerPage.enterParams({seg3: 'SEG3', mp2: 'MP2', qp2: 'QP2', fragment: 'FRAGMENT'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect named params to be substituted
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPopupParams()).toEqual(expect.objectContaining({component: 'testee', seg1: 'SEG1', seg3: 'SEG3', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'}));
    await expect(await popupPage.getRouteParams()).toEqual({segment1: 'SEG1', segment3: 'SEG3', mp1: 'MP1', mp2: 'MP2'});
    await expect(await popupPage.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect(await popupPage.getRouteFragment()).toEqual('FRAGMENT');
  });
});
