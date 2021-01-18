/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from '../app.po';
import { installSeleniumWebDriverClickFix } from '../helper/selenium-webdriver-click-fix';
import { RegisterWorkbenchCapabilityPagePO } from './page-object/register-workbench-capability-page.po';
import { consumeBrowserLog } from '../helper/testing.util';
import { PopupOpenerPagePO } from './page-object/popup-opener-page.po';
import { PopupPagePO } from './page-object/popup-page.po';

export declare type HTMLElement = any;

describe('Popup', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should allow passing a value to the popup component', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {entity: 'product', id: '*'},
      requiredParams: ['readonly'],
      properties: {
        path: 'popup',
        cssClass: 'product',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({entity: 'product', id: '123'});
    await popupOpenerPagePO.enterParams({readonly: 'true'});
    await popupOpenerPagePO.clickOpen();

    // expect qualifier to be contained in popup params
    const popupPagePO = new PopupPagePO('product');
    await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123', readonly: 'true'}));
  });

  it('should contain the qualifier in popup params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {entity: 'product', id: '*'},
      properties: {
        path: 'popup',
        cssClass: 'product',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({entity: 'product', id: '123'});
    await popupOpenerPagePO.clickOpen();

    // expect qualifier to be contained in popup params
    const popupPagePO = new PopupPagePO('product');
    await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123'}));
  });

  it('should not overwrite qualifier values with param values', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {entity: 'product', id: '*'},
      requiredParams: ['id'],
      properties: {
        path: 'popup',
        cssClass: 'product',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({entity: 'product', id: '123'});
    await popupOpenerPagePO.enterParams({id: '456'}); // should be ignored
    await popupOpenerPagePO.clickOpen();

    // expect qualifier values not to be overwritten by params
    const popupPagePO = new PopupPagePO('product');
    await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123'}));
  });

  it('should substitute named URL params with values of the qualifier and params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', seg1: '*', mp1: '*', qp1: '*'},
      requiredParams: ['seg3', 'mp2', 'qp2', 'fragment'],
      properties: {
        path: 'popup/:seg1/segment2/:seg3;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'});
    await popupOpenerPagePO.enterParams({seg3: 'SEG3', mp2: 'MP2', qp2: 'QP2', fragment: 'FRAGMENT'});
    await popupOpenerPagePO.clickOpen();

    // expect named params to be substituted
    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({component: 'testee', seg1: 'SEG1', seg3: 'SEG3', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'}));
    await expect(await popupPagePO.getRouteParams()).toEqual({segment1: 'SEG1', segment3: 'SEG3', mp1: 'MP1', mp2: 'MP2'});
    await expect(await popupPagePO.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect(await popupPagePO.getRouteFragment()).toEqual('FRAGMENT');
  });
});
