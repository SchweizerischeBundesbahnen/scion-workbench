/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {PopupPO} from '../../../popup.po';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';
import {PartPO} from '../../../part.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';
import {DesktopPO} from '../../../desktop.po';

/**
 * Page object to interact with {@link FocusTestPageComponent}.
 */
export class FocusTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;

  public firstField: Locator;
  public middleField: Locator;
  public lastField: Locator;

  constructor(private _locateBy: PartPO | ViewPO | DialogPO | PopupPO | DesktopPO) {
    this.locator = _locateBy.locator.locator('app-focus-test-page');
    this.firstField = this.locator.locator('input.e2e-first-field');
    this.middleField = this.locator.locator('input.e2e-middle-field');
    this.lastField = this.locator.locator('input.e2e-last-field');
  }

  public clickField(field: 'first-field' | 'middle-field' | 'last-field', options?: {timeout?: number}): Promise<void> {
    switch (field) {
      case 'first-field': {
        return this.firstField.click({timeout: options?.timeout});
      }
      case 'middle-field': {
        return this.middleField.click({timeout: options?.timeout});
      }
      case 'last-field': {
        return this.lastField.click({timeout: options?.timeout});
      }
    }
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
}
