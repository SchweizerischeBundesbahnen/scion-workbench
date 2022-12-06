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
import {ElementSelectors} from '../../../helper/element-selectors';
import {ViewTabPO} from '../../../view-tab.po';

export class ViewPropertiesTestPagePO {

  private readonly _locator: Locator;
  public readonly viewTab: ViewTabPO;

  constructor(appPO: AppPO, viewId: string) {
    this.viewTab = appPO.view({viewId}).viewTab;
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-view-properties-test-page');
  }

  public async waitUntilPresent(): Promise<void> {
    await this._locator.waitFor({state: 'attached'});
  }
}
