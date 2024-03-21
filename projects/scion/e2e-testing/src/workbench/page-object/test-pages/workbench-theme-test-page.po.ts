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
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {ViewId} from '@scion/workbench';

export class WorkbenchThemeTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly theme: Locator;
  public readonly colorScheme: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.view.locator.locator('app-workbench-theme-test-page');

    this.theme = this.locator.locator('span.e2e-theme');
    this.colorScheme = this.locator.locator('span.e2e-color-scheme');
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<WorkbenchThemeTestPagePO> {
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewId = await routerPage.view.getViewId();

    await routerPage.enterPath('test-pages/workbench-theme-test-page');
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    const view = appPO.view({cssClass: 'e2e-test-workbench-theme', viewId});
    await view.waitUntilAttached();
    return new WorkbenchThemeTestPagePO(appPO, {viewId});
  }
}
