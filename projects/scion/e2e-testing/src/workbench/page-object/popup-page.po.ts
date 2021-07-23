/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText} from '../../helper/testing.util';
import {AppPO, PopupPO} from '../../app.po';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {PopupSize} from '@scion/workbench';
import {SciAccordionPO} from '@scion/toolkit.internal/widgets.po';
import {ISize} from 'selenium-webdriver';

/**
 * Page object to interact {@link PopupPageComponent}.
 */
export class PopupPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly popupPO: PopupPO;

  constructor(public cssClass: string) {
    this.popupPO = this._appPO.findPopup({cssClass: cssClass});
    this._pageFinder = this.popupPO.$('app-popup-page');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isDisplayed();
  }

  public async getComponentInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    await enterText(size.width, this._pageFinder.$('input.e2e-width'));
    await enterText(size.height, this._pageFinder.$('input.e2e-height'));
    await enterText(size.minWidth, this._pageFinder.$('input.e2e-min-width'));
    await enterText(size.maxWidth, this._pageFinder.$('input.e2e-max-width'));
    await enterText(size.minHeight, this._pageFinder.$('input.e2e-min-height'));
    await enterText(size.maxHeight, this._pageFinder.$('input.e2e-max-height'));
  }

  public async clickClose(options?: {returnValue?: string, closeWithError?: boolean}): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError === true) {
      await this._pageFinder.$('button.e2e-close-with-error').click();
    }
    else {
      await this._pageFinder.$('button.e2e-close').click();
    }
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-return-value'));
    await accordionPO.expand();
    try {
      await enterText(returnValue, this._pageFinder.$('input.e2e-return-value'));
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getInput(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    return this._pageFinder.$('output.e2e-input').getText();
  }

  public async getPreferredOverlaySize(): Promise<PopupSize> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
    try {
      return JSON.parse(await this._pageFinder.$('div.e2e-preferred-overlay-size').getText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getSize(): Promise<ISize> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const {width, height} = await this._pageFinder.getSize();
    return {width, height};
  }
}
