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
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';
import {SciRouterOutletPO} from '../sci-router-outlet.po';

export class WorkbenchThemeTestPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  public readonly theme: Locator;
  public readonly colorScheme: Locator;

  constructor(private _appPO: AppPO, viewId: string) {
    this.outlet = new SciRouterOutletPO(this._appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-workbench-theme-test-page');

    this.theme = this.locator.locator('span.e2e-theme');
    this.colorScheme = this.locator.locator('span.e2e-color-scheme');
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<WorkbenchThemeTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {test: 'workbench-theme'},
      properties: {
        path: 'test-pages/workbench-theme-test-page',
        cssClass: 'e2e-test-workbench-theme',
        title: 'Workbench Theme Test Page',
        pinToStartPage: true,
      },
    });

    // Navigate to the view.
    const startPage = await appPO.openNewViewTab();
    await startPage.clickTestCapability('e2e-test-workbench-theme', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'e2e-test-workbench-theme', viewId: startPage.viewId});
    await view.waitUntilAttached();
    return new WorkbenchThemeTestPagePO(appPO, await view.getViewId());
  }
}
