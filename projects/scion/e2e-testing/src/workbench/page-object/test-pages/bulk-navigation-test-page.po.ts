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
import {waitUntilStable} from '../../../helper/testing.util';
import {RouterPagePO} from '../router-page.po';
import {WorkbenchNavigator} from '../../workbench-navigator';

export class BulkNavigationTestPagePO {

  private readonly _locator: Locator;

  constructor(private _appPO: AppPO, viewId: string) {
    this._locator = this._appPO.view({viewId}).locator('app-bulk-navigation-test-page');
  }

  public async enterViewCount(viewCount: number): Promise<void> {
    await this._locator.locator('input.e2e-view-count').fill(`${viewCount}`);
  }

  public async enterCssClass(cssClass: string): Promise<void> {
    await this._locator.locator('input.e2e-css-class').fill(cssClass);
  }

  public async clickNavigateNoAwait(): Promise<void> {
    await this._locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.page.url());
  }

  public async clickNavigateAwait(): Promise<void> {
    await this._locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.page.url());
  }

  public static async navigateTo(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<BulkNavigationTestPagePO> {
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-pages/bulk-navigation-test-page');
    await routerPagePO.clickNavigate();

    const view = await appPO.view({cssClass: 'e2e-test-bulk-navigation'});
    await view.waitUntilPresent();
    return new BulkNavigationTestPagePO(appPO, await view.getViewId());
  }
}
