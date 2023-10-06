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
import {ViewTabPO} from '../../../view-tab.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';

export class ViewPropertiesTestPagePO {

  public readonly locator: Locator;
  public readonly viewTab: ViewTabPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(appPO: AppPO, viewId: string) {
    this.viewTab = appPO.view({viewId}).viewTab;
    this.outlet = new SciRouterOutletPO(appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-view-properties-test-page');
  }

  public async waitUntilPresent(): Promise<void> {
    await this.locator.waitFor({state: 'attached'});
  }
}
