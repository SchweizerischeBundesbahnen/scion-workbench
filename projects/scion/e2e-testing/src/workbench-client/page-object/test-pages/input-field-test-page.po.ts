/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {isActiveElement} from '../../../helper/testing.util';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';
import {ViewPO} from '../../../view.po';
import {PopupPO} from '../../../popup.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';

export class InputFieldTestPagePO {

  public readonly locator: Locator;

  constructor(public outlet: SciRouterOutletPO, private _locateBy: ViewPO | PopupPO) {
    this.locator = this.outlet.frameLocator.locator('app-input-field-test-page');
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get popup(): PopupPO {
    if (this._locateBy instanceof PopupPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a popup.');
    }
  }

  public async clickInputField(options?: {timeout?: number}): Promise<void> {
    await this.locator.locator('input.e2e-input').click({timeout: options?.timeout});
  }

  public async isInputFieldActiveElement(): Promise<boolean> {
    return isActiveElement(this.locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<InputFieldTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'test-input-field',
        title: 'Input Field Test Page',
        pinToStartPage: true,
      },
    });
    await registerCapabilityPage.viewTab.close();

    // Navigate to the view.
    const startPage = await appPO.openNewViewTab();
    const viewId = startPage.viewId!;
    await startPage.clickTestCapability('test-input-field', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'test-input-field', viewId: viewId});
    await view.waitUntilAttached();

    const outlet = new SciRouterOutletPO(appPO, {name: viewId});
    return new InputFieldTestPagePO(outlet, view);
  }

  public static async openInPopup(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    // Register popup capability.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'test-input-field',
      },
    });

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({test: 'input-field'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPage.clickOpen();

    // Create the page object.
    const popup = appPO.popup({cssClass: 'test-input-field'});
    await popup.waitUntilAttached();

    const outlet = new SciRouterOutletPO(appPO, {cssClass: ['e2e-popup', 'test-input-field']});
    return new InputFieldTestPagePO(outlet, popup);
  }
}
