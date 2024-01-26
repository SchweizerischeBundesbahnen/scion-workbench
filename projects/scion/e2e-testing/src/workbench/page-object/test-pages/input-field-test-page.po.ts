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
import {WorkbenchNavigator} from '../../workbench-navigator';
import {RouterPagePO} from '../router-page.po';
import {ViewPO} from '../../../view.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {PopupPO} from '../../../popup.po';
import {DialogPO} from '../../../dialog.po';

export class InputFieldTestPagePO {

  public readonly locator: Locator;
  public readonly checkbox: Locator;

  constructor(private _locateBy: ViewPO | PopupPO | DialogPO) {
    this.locator = this._locateBy.locator.locator('app-input-field-test-page');
    this.checkbox = this.locator.locator('input.e2e-checkbox');
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

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
    }
  }

  public async clickInputField(): Promise<void> {
    await this.locator.locator('input.e2e-input').click();
  }

  public async isInputFieldActiveElement(): Promise<boolean> {
    return isActiveElement(this.locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<InputFieldTestPagePO> {
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-pages/input-field-test-page');
    await routerPage.enterTarget(routerPage.viewId);
    await routerPage.enterCssClass('input-field-test-page');
    await routerPage.clickNavigate();

    const view = appPO.view({cssClass: 'input-field-test-page', viewId: routerPage.viewId});
    await view.waitUntilAttached();
    return new InputFieldTestPagePO(view);
  }

  public static async openInPopup(appPO: AppPO, workbenchNavigator: WorkbenchNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    // Open the popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPage.enterCssClass('input-field-test-page');
    await popupOpenerPage.selectPopupComponent('input-field-test-page');
    await popupOpenerPage.clickOpen();

    // Create the page object.
    const popup = appPO.popup({cssClass: 'input-field-test-page'});
    await popup.waitUntilAttached();
    return new InputFieldTestPagePO(popup);
  }
}
