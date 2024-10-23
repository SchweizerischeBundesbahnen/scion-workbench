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
import {AppPO} from '../../../app.po';
import {ViewId} from '@scion/workbench';
import {PopupPO} from '../../../popup.po';

export class PopupPositionTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly openButton: Locator;
  public readonly marginTop: Locator;
  public readonly marginRight: Locator;
  public readonly marginBottom: Locator;
  public readonly marginLeft: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-popup-position-test-page');
    this.openButton = this.locator.locator('button.e2e-open');
    this.marginTop = this.locator.locator('input.e2e-margin-top');
    this.marginRight = this.locator.locator('input.e2e-margin-right');
    this.marginBottom = this.locator.locator('input.e2e-margin-bottom');
    this.marginLeft = this.locator.locator('input.e2e-margin-left');
  }

  public async open(): Promise<PopupPO> {
    await this.locator.locator('button.e2e-open').click();
    const popup = new PopupPO(this.locator.page().locator('wb-popup'));
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
