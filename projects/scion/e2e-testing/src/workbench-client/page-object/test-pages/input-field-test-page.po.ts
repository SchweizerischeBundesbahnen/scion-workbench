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
import {ViewPO} from '../../../view.po';
import {PopupPO} from '../../../popup.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {DialogId, PartId, PopupId, ViewId} from '@scion/workbench-client';
import {PartPO} from '../../../part.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';
import {DialogPO} from '../../../dialog.po';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {RequireOne} from '../../../helper/utility-types';

export class InputFieldTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly input: Locator;

  constructor(private _appPO: AppPO, locateBy: RequireOne<{id: ViewId | PartId | PopupId | DialogId; cssClass: string}>) {
    this.part = this._appPO.part({partId: locateBy.id as PartId | undefined, cssClass: locateBy.cssClass});
    this.view = this._appPO.view({viewId: locateBy.id as ViewId | undefined, cssClass: locateBy.cssClass});
    this.dialog = this._appPO.dialog({dialogId: locateBy.id as DialogId | undefined, cssClass: locateBy.cssClass});
    this.popup = this._appPO.popup({popupId: locateBy.id as PopupId | undefined, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.id, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-input-field-test-page');
    this.input = this.locator.locator('input.e2e-input');
  }

  public async enterText(text: string): Promise<void> {
    await this.input.fill(text);
  }

  public async clickInputField(options?: {timeout?: number}): Promise<void> {
    await this.input.click({timeout: options?.timeout});
  }
}
