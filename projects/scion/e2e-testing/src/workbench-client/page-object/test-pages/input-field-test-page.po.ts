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
import {RouterPagePO} from '../router-page.po';

export class InputFieldTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;

  constructor(public outlet: SciRouterOutletPO, private _locateBy: ViewPO | PopupPO) {
    this.locator = this.outlet.frameLocator.locator('app-input-field-test-page');
    this.input = this.locator.locator('input.e2e-input');
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
    const identifier = `testee-${crypto.randomUUID()}`;
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/input-field-test-page',
        title: 'Input Field Test Page',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({test: identifier}, {
      cssClass: identifier,
      target: 'blank',
    });
    await routerPage.view.tab.close();

    const view = appPO.view({cssClass: identifier});
    const outlet = new SciRouterOutletPO(appPO, {cssClass: identifier});
    return new InputFieldTestPagePO(outlet, view);
  }

  public static async openInPopup(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    const identifier = `testee-${crypto.randomUUID()}`;
    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/input-field-test-page',
      },
    });

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({test: identifier});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPage.enterCssClass(identifier);
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: identifier});
    const outlet = new SciRouterOutletPO(appPO, {cssClass: identifier});
    return new InputFieldTestPagePO(outlet, popup);
  }
}
