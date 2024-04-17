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
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {ViewId} from '@scion/workbench';

export class BulkNavigationTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.view.locator.locator('app-bulk-navigation-test-page');
  }

  public async enterViewCount(viewCount: number): Promise<void> {
    await this.locator.locator('input.e2e-view-count').fill(`${viewCount}`);
  }

  public async enterCssClass(cssClass: string): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(cssClass);
  }

  public async clickNavigateNoAwait(): Promise<void> {
    await this.locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  public async clickNavigateAwait(): Promise<void> {
    await this.locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<BulkNavigationTestPagePO> {
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewId = await routerPage.view.getViewId();

    await routerPage.enterPath('test-pages/bulk-navigation-test-page');
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    const view = appPO.view({cssClass: 'e2e-test-bulk-navigation', viewId});
    await view.waitUntilAttached();
    return new BulkNavigationTestPagePO(appPO, {viewId: await view.getViewId()});
  }
}
