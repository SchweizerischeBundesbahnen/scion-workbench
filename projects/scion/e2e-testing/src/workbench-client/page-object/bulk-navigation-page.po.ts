/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {Locator} from '@playwright/test';
import {waitUntilStable} from '../../helper/testing.util';
import {ElementSelectors} from '../../helper/element-selectors';
import {MicrofrontendNavigator} from '../microfrontend-navigator';
import {RouterPagePO} from './router-page.po';

export class BulkNavigationPagePO {

  private readonly _locator: Locator;

  constructor(private _appPO: AppPO, viewId: string) {
    this._locator = this._appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-bulk-navigation-page');
  }

  public async enterViewCount(viewCount: number): Promise<void> {
    await this._locator.locator('input.e2e-view-count').fill(`${viewCount}`);
  }

  public async clickNavigateNoAwait(): Promise<void> {
    await this._locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(async () => this._appPO.page.url());
  }

  public async clickNavigateAwait(): Promise<void> {
    await this._locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    // Since waiting for microfrontends to load takes some time, an interval of 500ms is used.
    await waitUntilStable(async () => this._appPO.page.url(), {probeInterval: 500});
  }

  public static async navigateTo(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<BulkNavigationPagePO> {
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'bulk-navigation', app: 'app1'});
    await routerPagePO.clickNavigate({evalNavigateResponse: false});

    const view = await appPO.findView({cssClass: 'e2e-test-bulk-navigation'});
    await view.waitUntilPresent();
    return new BulkNavigationPagePO(appPO, await view.getViewId());
  }
}
