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
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';

export class BulkNavigationTestPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, viewId: string) {
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
   *
   * @param options - Controls how to navigate.
   *        @property probeInternal - Time to wait in ms until navigation is stable. Useful when performing many navigations simultaneously.
   */
  public async clickNavigateNoAwait(options?: {probeInterval?: number}): Promise<void> {
    await this.locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId(), options);
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   *
   * @param options - Controls how to navigate.
   *        @property probeInternal - Time to wait in ms until navigation is stable. Useful when performing many navigations simultaneously.
   */
  public async clickNavigateAwait(options?: {probeInterval?: number}): Promise<void> {
    await this.locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId(), options);
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<BulkNavigationTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await startPage.clickTestCapability('e2e-test-bulk-navigation', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'e2e-test-bulk-navigation', viewId: startPage.viewId});
    await view.waitUntilAttached();
    return new BulkNavigationTestPagePO(appPO, await view.getViewId());
  }
}
