/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO, MessageBoxPO} from './app.po';
import {browser, ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from './helper/webdriver-execution-context';

/**
 * Page object to interact {@link TextMessageComponent}.
 */
export class TextMessagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly msgboxPO: MessageBoxPO;

  constructor(public cssClass: string) {
    this.msgboxPO = this._appPO.findMessageBox({cssClass: cssClass});
    this._pageFinder = this.msgboxPO.$('wb-text-message');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return await this.msgboxPO.isPresent() && await this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return await this.msgboxPO.isDisplayed() && await this._pageFinder.isDisplayed();
  }

  public async getText(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.getText();
  }

  public async isContentSelectable(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    const text = await this._pageFinder.getText();

    await browser.actions().mouseMove(this._pageFinder).perform();
    await browser.actions().doubleClick().perform();
    const selection: string = await browser.executeScript('return window.getSelection().toString();') as string;

    return selection && selection.length && text.includes(selection);
  }
}
