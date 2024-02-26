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
import {PopupPO} from '../../../popup.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';

export class MicrofrontendPopupTestPagePO implements MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(public popup: PopupPO) {
    this.outlet = new SciRouterOutletPO(new AppPO(popup.locator.page()), {locator: this.popup.locator.locator('sci-router-outlet')});
    this.locator = this.outlet.frameLocator.locator('app-microfrontend-test-page');
  }
}
