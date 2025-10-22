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
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {ViewPO} from '../../../view.po';
import {PopupPO} from '../../../popup.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {PartId} from '@scion/workbench-client';
import {PartPO} from '../../../part.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';

export class InputFieldTestPagePO implements MicrofrontendViewPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;

  constructor(public outlet: SciRouterOutletPO, private _locateBy: PartPO | ViewPO | PopupPO) {
    this.locator = this.outlet.frameLocator.locator('app-input-field-test-page');
    this.input = this.locator.locator('input.e2e-input');
  }

  public async enterText(text: string): Promise<void> {
    await this.input.fill(text);
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
    await this.input.click({timeout: options?.timeout});
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<InputFieldTestPagePO> {
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'test-input-field',
        title: 'Input Field Test Page',
        pinToDesktop: true,
      },
    });

    // Navigate to the view.
    const startPage = await appPO.openNewViewTab();
    const viewId = await startPage.view.getViewId();
    await startPage.clickTestCapability('test-input-field', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'test-input-field', viewId: viewId});
    await view.waitUntilAttached();

    const outlet = new SciRouterOutletPO(appPO, {name: viewId});
    return new InputFieldTestPagePO(outlet, view);
  }

  public static async openInPopup(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    await microfrontendNavigator.registerCapability('app1', {
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
    await popupOpenerPage.open();

    // Create the page object.
    const popup = appPO.popup({cssClass: 'test-input-field'});
    await popup.locator.waitFor({state: 'attached'});

    const outlet = new SciRouterOutletPO(appPO, {cssClass: ['e2e-popup', 'test-input-field']});
    return new InputFieldTestPagePO(outlet, popup);
  }

  public static newPartPO(appPO: AppPO, locateBy: {partId?: PartId; cssClass?: string}): InputFieldTestPagePO {
    const part = appPO.part({partId: locateBy.partId, cssClass: locateBy.cssClass});
    const outlet = new SciRouterOutletPO(appPO, {name: locateBy.partId, cssClass: locateBy.cssClass});
    return new InputFieldTestPagePO(outlet, part);
  }
}
