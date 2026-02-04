/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
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
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';
import {PopupPO} from '../../../popup.po';
import {PartPO} from '../../../part.po';
import {toTypedString} from '../../../helper/typed-value.util';

export class BadgeTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;

  public readonly part: PartPO;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO) {
    this.outlet = new SciRouterOutletPO(locateBy.locator.page(), {name: locateBy.locateBy?.id, cssClass: locateBy.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-badge-test-page');

    this.part = locateBy instanceof PartPO ? locateBy : undefined!;
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;
  }

  public async provideBadge(key: string, value: string | number | boolean | undefined): Promise<void> {
    await this.locator.locator('section.e2e-provide-value input.e2e-key').fill(key);
    await this.locator.locator('section.e2e-provide-value input.e2e-value').fill(toTypedString(value));
    await this.locator.locator('section.e2e-provide-value button.e2e-save').click();
  }
}
