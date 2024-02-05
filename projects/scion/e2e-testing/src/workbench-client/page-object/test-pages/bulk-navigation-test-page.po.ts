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
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';

export class BulkNavigationTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, viewId: string) {
    this.view = this._appPO.view({viewId});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-bulk-navigation-test-page');
  }

  public async enterViewCount(viewCount: number): Promise<void> {
    await this.locator.locator('input.e2e-view-count').fill(`${viewCount}`);
  }

  public async enterCssClass(cssClass: string): Promise<void> {
    await this.locator.locator('input.e2e-css-class').fill(cssClass);
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigateNoAwait(): Promise<void> {
    await this.locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigateAwait(): Promise<void> {
    await this.locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<BulkNavigationTestPagePO> {
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: 'bulk-navigation'},
      properties: {
        path: 'test-pages/bulk-navigation-test-page',
        cssClass: 'e2e-test-bulk-navigation',
        title: 'Bulk Navigation Test',
        pinToStartPage: true,
      },
    });

    // Navigate to the view.
    const startPage = await appPO.openNewViewTab();
    const viewId = await startPage.view.getViewId();
    await startPage.clickTestCapability('e2e-test-bulk-navigation', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'e2e-test-bulk-navigation', viewId: viewId});
    await view.waitUntilAttached();
    return new BulkNavigationTestPagePO(appPO, viewId);
  }
}
