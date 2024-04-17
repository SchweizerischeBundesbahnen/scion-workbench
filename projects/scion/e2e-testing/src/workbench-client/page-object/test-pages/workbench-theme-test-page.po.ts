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
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {ViewId} from '@scion/workbench-client';

export class WorkbenchThemeTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  public readonly theme: Locator;
  public readonly colorScheme: Locator;

  constructor(appPO: AppPO, viewId: ViewId) {
    this.view = appPO.view({viewId});
    this.outlet = new SciRouterOutletPO(appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-workbench-theme-test-page');

    this.theme = this.locator.locator('span.e2e-theme');
    this.colorScheme = this.locator.locator('span.e2e-color-scheme');
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<WorkbenchThemeTestPagePO> {
    await microfrontendNavigator.registerCapability('app1', {
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
    const viewId = await startPage.view.getViewId();
    await startPage.clickTestCapability('e2e-test-workbench-theme', 'app1');

    // Create the page object.
    const view = appPO.view({cssClass: 'e2e-test-workbench-theme', viewId: viewId});
    await view.waitUntilAttached();
    return new WorkbenchThemeTestPagePO(appPO, viewId);
  }
}
