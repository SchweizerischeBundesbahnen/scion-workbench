/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ViewPO} from '../../../view.po';
import {DomRect, fromRect} from '../../../helper/testing.util';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {PopupPO} from '../../../popup.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';

export class SizeTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;

  constructor(private _locateBy: ViewPO | DialogPO | PopupPO) {
    this.locator = this._locateBy.locator.locator('app-size-test-page');
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

  public async getRecordedSizeChanges(): Promise<string[]> {
    const sizes = new Array<string>();
    for (const size of await this.locator.locator('span.e2e-size').all()) {
      sizes.push(await size.innerText());
    }
    return sizes;
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
