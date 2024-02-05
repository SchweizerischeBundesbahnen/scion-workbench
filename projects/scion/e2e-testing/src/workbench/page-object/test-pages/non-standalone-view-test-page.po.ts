/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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
import {WorkbenchViewPagePO} from '../workbench-view-page.po';

export class NonStandaloneViewTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, locateBy: {viewId?: string; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.view.locator.locator('app-non-standalone-view-test-page');
  }
}
