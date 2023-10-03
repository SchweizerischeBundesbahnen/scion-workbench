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
import {isActiveElement, orElseThrow} from '../../../helper/testing.util';
import {WorkbenchNavigator} from '../../workbench-navigator';
import {RouterPagePO} from '../router-page.po';
import {ViewPO} from '../../../view.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {PopupPO} from '../../../popup.po';

export class InputFieldTestPagePO {

  private readonly _locator: Locator;
  private readonly _view: ViewPO | undefined;
  private readonly _popup: PopupPO | undefined;

  constructor(locator: Locator, pageObject: {view?: ViewPO; popup?: PopupPO}) {
    this._view = pageObject.view;
    this._popup = pageObject.popup;
    this._locator = locator;
  }

  public get view(): ViewPO {
    return orElseThrow(this._view, () => Error('[IllegalStateError] Test page not opened in a view.'));
  }

  public get popup(): PopupPO {
    return orElseThrow(this._popup, () => Error('[IllegalStateError] Test page not opened in a popup.'));
  }

  public async clickInputField(): Promise<void> {
    await this._locator.locator('input.e2e-input').click();
  }

  public async isInputFieldActiveElement(): Promise<boolean> {
    return isActiveElement(this._locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, workbenchNavigator: WorkbenchNavigator): Promise<InputFieldTestPagePO> {
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-pages/input-field-test-page');
    await routerPagePO.enterTarget(routerPagePO.viewId);
    await routerPagePO.enterCssClass('input-field-test-page');
    await routerPagePO.clickNavigate();

    const view = await appPO.view({cssClass: 'input-field-test-page', viewId: routerPagePO.viewId});
    await view.waitUntilAttached();

    return new InputFieldTestPagePO(view.locator('app-input-field-test-page'), {view});
  }

  public static async openInPopup(appPO: AppPO, workbenchNavigator: WorkbenchNavigator, popupOptions?: {closeOnFocusLost?: boolean}): Promise<InputFieldTestPagePO> {
    // Open the popup.
    const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: popupOptions?.closeOnFocusLost});
    await popupOpenerPagePO.enterCssClass('input-field-test-page');
    await popupOpenerPagePO.selectPopupComponent('input-field-test-page');
    await popupOpenerPagePO.clickOpen();

    // Create the page object.
    const popup = await appPO.popup({cssClass: 'input-field-test-page'});
    await popup.waitUntilAttached();

    return new InputFieldTestPagePO(popup.locator('app-input-field-test-page'), {popup});
  }
}
