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
import {RouterPagePO} from '../router-page.po';

export class WorkbenchThemeTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  public readonly theme: Locator;
  public readonly colorScheme: Locator;

  constructor(appPO: AppPO, locateBy: {cssClass: string}) {
    this.view = appPO.view({cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-workbench-theme-test-page');

    this.theme = this.locator.locator('span.e2e-theme');
    this.colorScheme = this.locator.locator('span.e2e-color-scheme');
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<WorkbenchThemeTestPagePO> {
    const identifier = `testee-${crypto.randomUUID()}`;
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/workbench-theme-test-page',
        title: 'Workbench Theme Test Page',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({test: identifier}, {
      cssClass: identifier,
      target: 'blank',
    });
    await routerPage.view.tab.close();

    return new WorkbenchThemeTestPagePO(appPO, {cssClass: identifier});
  }
}
