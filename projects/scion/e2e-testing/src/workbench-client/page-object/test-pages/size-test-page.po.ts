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
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {DomRect, fromRect} from '../../../helper/testing.util';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {DialogPO} from '../../../dialog.po';
import {PopupPO} from '../../../popup.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';
import {AppPO} from '../../../app.po';
import {DialogId, PartId, PopupId, ViewId} from '@scion/workbench-client';
import {RequireOne} from '../../../helper/utility-types';

export class SizeTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(appPO: AppPO, locateBy: RequireOne<{id: PartId | ViewId | DialogId | PopupId; cssClass: string}>) {
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy.id, cssClass: locateBy.cssClass});
    this.view = appPO.view({viewId: locateBy.id as ViewId | undefined, cssClass: locateBy.cssClass});
    this.dialog = appPO.dialog({dialogId: locateBy.id as DialogId | undefined, cssClass: locateBy.cssClass});
    this.popup = appPO.popup({popupId: locateBy.id as PopupId | undefined, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy.id, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-size-test-page');
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
