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
import {WorkbenchNavigator} from '../../workbench-navigator';
import {RouterPagePO} from '../router-page.po';

export class WorkbenchThemeTestPagePO {

  public readonly locator: Locator;

  public readonly theme: Locator;
  public readonly colorScheme: Locator;

  constructor(private _appPO: AppPO, viewId: string) {
    this.locator = this._appPO.view({viewId}).locate('app-workbench-theme-test-page');

    this.theme = this.locator.locator('span.e2e-theme');
    this.colorScheme = this.locator.locator('span.e2e-color-scheme');
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<WorkbenchThemeTestPagePO> {
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-pages/workbench-theme-test-page');
    await routerPage.enterTarget(routerPage.viewId);
    await routerPage.clickNavigate();

    const view = appPO.view({cssClass: 'e2e-test-workbench-theme', viewId: routerPage.viewId});
    await view.waitUntilAttached();
    return new WorkbenchThemeTestPagePO(appPO, await view.getViewId());
  }
}
