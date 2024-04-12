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
import {WorkbenchNavigator} from '../../workbench-navigator';
import {RouterPagePO} from '../router-page.po';
import {ViewPO} from '../../../view.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {PopupPO} from '../../../popup.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';

export class InputFieldTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly checkbox: Locator;
  public readonly input: Locator;

  constructor(private _locateBy: ViewPO | DialogPO | PopupPO) {
    this.locator = this._locateBy.locator.locator('app-input-field-test-page');
    this.checkbox = this.locator.locator('input.e2e-checkbox');
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

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
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

  public async enterText(text: string, options?: {pressSequentially?: boolean}): Promise<void> {
    if (options?.pressSequentially) {
      await this.input.pressSequentially(text);
    }
    else {
      await this.input.fill(text);
    }
  }

  public async clickInputField(): Promise<void> {
    await this.input.click();
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<InputFieldTestPagePO> {
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewId = await routerPage.view.getViewId();

    await routerPage.navigate(['test-pages/input-field-test-page'], {
      target: viewId,
      cssClass: 'input-field-test-page'
    });

    const view = appPO.view({cssClass: 'input-field-test-page', viewId});
    await view.waitUntilAttached();
    return new InputFieldTestPagePO(view);
  }

  public static async openInPopup(appPO: AppPO, workbenchNavigator: WorkbenchNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    // Open the popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPage.enterCssClass('input-field-test-page');
    await popupOpenerPage.selectPopupComponent('input-field-test-page');
    await popupOpenerPage.open();

    // Create the page object.
    const popup = appPO.popup({cssClass: 'input-field-test-page'});
    await popup.locator.waitFor({state: 'attached'});
    return new InputFieldTestPagePO(popup);
  }
}
