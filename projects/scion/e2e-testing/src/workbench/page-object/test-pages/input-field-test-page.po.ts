/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ViewPO} from '../../../view.po';
import {PopupPO} from '../../../popup.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';
import {PartPO} from '../../../part.po';

export class InputFieldTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly checkbox: Locator;
  public readonly input: Locator;

  constructor(private _locateBy: PartPO | ViewPO | DialogPO | PopupPO) {
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
}
