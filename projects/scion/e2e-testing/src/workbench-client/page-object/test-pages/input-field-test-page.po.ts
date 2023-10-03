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
import {isActiveElement, orElseThrow} from '../../../helper/testing.util';
import {ElementSelectors} from '../../../helper/element-selectors';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';
import {ViewPO} from '../../../view.po';
import {PopupPO} from '../../../popup.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';

export class InputFieldTestPagePO {

  private readonly _locator: Locator;
  private readonly _view: ViewPO | undefined;
  private readonly _popup: PopupPO | undefined;

  constructor(locator: Locator, pageObject: {view?: ViewPO; popup?: PopupPO}) {
    this._view = pageObject.view;
    this._popup = pageObject.popup;
    this._locator = locator;
  }

  public get view(): ViewPO {
    return orElseThrow(this._view, () => Error('[IllegalStateError] Test page not opened in a view.'));
  }

  public get popup(): PopupPO {
    return orElseThrow(this._popup, () => Error('[IllegalStateError] Test page not opened in a popup.'));
  }

  public async clickInputField(): Promise<void> {
    await this._locator.locator('input.e2e-input').click();
  }

  public async isInputFieldActiveElement(): Promise<boolean> {
    return isActiveElement(this._locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<InputFieldTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'test-input-field',
        title: 'Input Field Test Page',
        pinToStartPage: true,
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // Navigate to the view.
    const startPagePO = await appPO.openNewViewTab();
    const viewId = startPagePO.viewId!;
    await startPagePO.clickTestCapability('test-input-field', 'app1');

    // Create the page object.
    const view = await appPO.view({cssClass: 'test-input-field', viewId: viewId});
    await view.waitUntilAttached();

    const locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-input-field-test-page');
    return new InputFieldTestPagePO(locator, {view});
  }

  public static async openInPopup(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    // Register popup capability.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'test-input-field',
      },
    });

    // Open the popup.
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({test: 'input-field'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPagePO.clickOpen();

    // Create the page object.
    const popup = await appPO.popup({cssClass: 'test-input-field'});
    await popup.waitUntilAttached();

    const locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame({cssClass: ['e2e-popup', 'test-input-field']})).locator('app-input-field-test-page');
    return new InputFieldTestPagePO(locator, {popup});
  }
}
