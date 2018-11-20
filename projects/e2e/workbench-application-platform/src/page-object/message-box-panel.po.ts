/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $, browser, protractor } from 'protractor';
import { checkCheckbox, selectOption, switchToIFrameContext, switchToMainContext } from '../util/testing.util';
import { Qualifier, Severity } from '@scion/workbench-application-platform.api';
import { SciParamsEnterPanelPO } from './sci-params-enter.po';

export class MessageBoxPanelPO {

  private _panel = $('app-message-box-panel');
  private _cssClasses: string[] = [];

  constructor(public iframeContext: string[]) {
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciParamsEnterPanelPO().enterParams(qualifier, this._panel.$('.e2e-qualifier-panel'));
  }

  public async enterTitle(label: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#title');
    await inputField.clear();
    await inputField.sendKeys(label);
    return Promise.resolve();
  }

  public async enterText(text: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#text');
    await inputField.clear();
    await inputField.sendKeys(text);
    return Promise.resolve();
  }

  public async selectSeverity(value: Severity): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await selectOption(value, this._panel.$('select#severity'));
  }

  public async selectModality(value: 'view' | 'application'): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await selectOption(value, this._panel.$('select#modality'));
  }

  public async checkContentSelectable(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#content-selectable'));
  }

  public async enterCssClass(cssClass: string): Promise<void> {
    this._cssClasses = cssClass.split(/\s+/);

    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#css-class');
    await inputField.clear();
    await inputField.sendKeys(cssClass);
    return Promise.resolve();
  }

  /**
   * Enters given JSON object into the payload field.
   */
  public async enterPayload(payload: any): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = $('#payload');
    await inputField.clear();
    await inputField.sendKeys(JSON.stringify(payload));
    return Promise.resolve();
  }

  public async enterActions(actions: { [key: string]: string }): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciParamsEnterPanelPO().enterParams(actions, this._panel.$('.e2e-action-panel'));
  }

  public async getCloseAction(): Promise<string> {
    await switchToIFrameContext(this.iframeContext);
    return this._panel.$('output.e2e-close-action').getText();
  }

  public async open(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button.e2e-open').click();

    // wait until the animation completes
    if (this._cssClasses.length) {
      await switchToMainContext();
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable($(`wb-message-box.${this._cssClasses.join('.')}`)), 5000);
    }
  }
}
