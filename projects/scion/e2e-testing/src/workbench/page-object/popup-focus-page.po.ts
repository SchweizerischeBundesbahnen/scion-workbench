/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, isActiveElement} from '../../helper/testing.util';
import {AppPO, PopupPO} from '../../app.po';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';

/**
 * Page object to interact {@link PopupFocusPageComponent}.
 */
export class PopupFocusPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly popupPO: PopupPO;

  constructor(public cssClass: string) {
    this.popupPO = this._appPO.findPopup({cssClass: cssClass});
    this._pageFinder = this.popupPO.$('app-popup-focus-page');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isDisplayed();
  }

  public async isActiveElement(field: 'first-field' | 'middle-field' | 'last-field'): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return isActiveElement(this._pageFinder.$(`input.e2e-${field}`));
  }

  public async clickField(field: 'first-field' | 'middle-field' | 'last-field'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$(`input.e2e-${field}`).click();
  }
}
