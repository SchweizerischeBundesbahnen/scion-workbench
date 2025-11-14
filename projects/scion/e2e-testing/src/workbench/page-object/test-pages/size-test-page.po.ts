/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../../view.po';
import {RouterPagePO} from '../router-page.po';
import {DomRect, fromRect} from '../../../helper/testing.util';
import {DialogOpenerPagePO} from '../dialog-opener-page.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {WorkbenchNavigator} from '../../workbench-navigator';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
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

  public static async openInNewTab(appPO: AppPO): Promise<SizeTestPagePO> {
    const workbenchNavigator = new WorkbenchNavigator(appPO);
    const cssClass = `size-${crypto.randomUUID()}`;

    // Open view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/size-test-page'], {cssClass});

    const view = appPO.view({cssClass});
    return new SizeTestPagePO(view);
  }

  public static async openInDialog(appPO: AppPO): Promise<SizeTestPagePO> {
    const workbenchNavigator = new WorkbenchNavigator(appPO);
    const cssClass = `size-${crypto.randomUUID()}`;

    // Open dialog.
    const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
    await dialogOpenerPage.open('size-test-page', {cssClass});

    const dialog = appPO.dialog({cssClass});
    return new SizeTestPagePO(dialog);
  }

  public static async openInPopup(appPO: AppPO, options?: {position: 'element' | 'coordinate'}): Promise<SizeTestPagePO> {
    const workbenchNavigator = new WorkbenchNavigator(appPO);
    const cssClass = `size-${crypto.randomUUID()}`;
    const position = options?.position ?? 'element';

    // Open popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('size-test-page', {
      anchor: position === 'element' ? 'element' : {top: 100, left: 100},
      size: {minHeight: '100px', minWidth: '500px'},
      closeStrategy: {onFocusLost: false},
      cssClass,
    });

    const popup = appPO.popup({cssClass});
    return new SizeTestPagePO(popup);
  }
}
