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
import {isActiveElement} from '../../../helper/testing.util';
import {WorkbenchNavigator} from '../../workbench-navigator';
import {RouterPagePO} from '../router-page.po';
import {ViewPO} from '../../../view.po';

export class InputFieldTestPagePO {

  private readonly _locator: Locator;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, viewId: string) {
    this.view = appPO.view({viewId});
    this._locator = this.view.locator('app-input-field-test-page');
  }

  public async clickInputField(): Promise<void> {
    await this._locator.locator('input.e2e-input').click();
  }

  public async isActiveElement(): Promise<boolean> {
    return isActiveElement(this._locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<InputFieldTestPagePO> {
    const cssClass = 'input-field-test-page';
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-pages/input-field-test-page');
    await routerPagePO.enterTarget(routerPagePO.viewId);
    await routerPagePO.enterCssClass(cssClass);
    await routerPagePO.clickNavigate();

    const view = await appPO.view({cssClass, viewId: routerPagePO.viewId});
    await view.waitUntilPresent();
    return new InputFieldTestPagePO(appPO, await view.getViewId());
  }
}
