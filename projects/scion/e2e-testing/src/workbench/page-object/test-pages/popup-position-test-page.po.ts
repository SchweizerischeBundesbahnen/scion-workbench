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
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {PopupPO} from '../../../popup.po';
import {PartPO} from '../../../part.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';

export class PopupPositionTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly openButton: Locator;
  public readonly marginTop: Locator;
  public readonly marginRight: Locator;
  public readonly marginBottom: Locator;
  public readonly marginLeft: Locator;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO) {
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;
    this.locator = locateBy.locator.locator('app-popup-position-test-page');
    this.openButton = this.locator.locator('button.e2e-open');
    this.marginTop = this.locator.locator('input.e2e-margin-top');
    this.marginRight = this.locator.locator('input.e2e-margin-right');
    this.marginBottom = this.locator.locator('input.e2e-margin-bottom');
    this.marginLeft = this.locator.locator('input.e2e-margin-left');
  }

  public async open(): Promise<PopupPO> {
    await this.locator.locator('button.e2e-open').click();
    const popup = new PopupPO(this.locator.page(), {cssClass: []}, {nth: 0});
    await popup.locator.waitFor({state: 'attached'});
    return popup;
  }

  public async enterMarginTop(value: string): Promise<void> {
    await this.marginTop.fill(value);
  }

  public async enterMarginRight(value: string): Promise<void> {
    await this.marginRight.fill(value);
  }

  public async enterMarginBottom(value: string): Promise<void> {
    await this.marginBottom.fill(value);
  }

  public async enterMarginLeft(value: string): Promise<void> {
    await this.marginLeft.fill(value);
  }
}
