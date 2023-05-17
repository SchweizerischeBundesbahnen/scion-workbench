/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link RouteRegisterPageComponent}.
 */
export class RouteRegisterPagePO {

  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewPO = appPO.view({viewId});
    this.viewTabPO = this.viewPO.viewTab;
    this._locator = this.viewPO.locator('app-route-register-page');
  }

  public async registerRoute(route: {path: string; component: 'view-page' | 'router-page'; outlet?: string}, routeData?: {title?: string; cssClass?: string | string[]}): Promise<void> {
    await this._locator.locator('input.e2e-path').fill(route.path);
    await this._locator.locator('input.e2e-component').fill(route.component);
    await this._locator.locator('input.e2e-outlet').fill(route.outlet ?? '');
    await this._locator.locator('section.e2e-route-data').locator('input.e2e-title').fill(routeData?.title ?? '');
    await this._locator.locator('section.e2e-route-data').locator('input.e2e-css-class').fill(coerceArray(routeData?.cssClass).join(' '));
    await this._locator.locator('button.e2e-register').click();
  }
}
