/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO, MessageBoxPO} from './app.po';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from './helper/webdriver-execution-context';
import {assertPageToDisplay, enterText, selectOption} from './helper/testing.util';
import {Dictionary} from '../deps/scion/toolkit/dictionaries.util';
import {Arrays} from '../deps/scion/toolkit/arrays.util';
import {SciParamsEnterPO} from '../deps/scion/toolkit.internal/params-enter/params-enter.po';

/**
 * Page object to interact {@link InspectMessageBoxComponent}.
 */
export class InspectMessageBoxPO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly msgboxPO: MessageBoxPO;

  constructor(public cssClass: string) {
    this.msgboxPO = this._appPO.findMessageBox({cssClass: cssClass});
    this._pageFinder = this.msgboxPO.$('app-inspect-message-box');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return await this.msgboxPO.isPresent() && await this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();

    if (!await this.isPresent()) {
      return false;
    }
    return await this.msgboxPO.isDisplayed() && await this._pageFinder.isDisplayed();
  }

  public async getComponentInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async getInput(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.$('output.e2e-input').getText();
  }

  public async getInputAsMap(): Promise<Map<string, any>> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const rawContent = await this.getInput();
    const map = new Map();

    // Sample Map content:
    // {"$implicit" => undefined}
    // {"component" => "inspector"}
    // {"ɵAPP_SYMBOLIC_NAME" => "workbench-client-testing-app1"}
    // {"ɵCLIENT_ID" => "ff94819f-0b89-42da-8ed4-843698041b2a"}
    // {"ɵMESSAGE_ID" => "f12d4268-cd79-4356-ac5f-4e4e62a6e87e"}
    // {"ɵREPLY_TO" => "d28233aa-566b-4696-b225-07e35b1d50b6"}
    // {"ɵTIMESTAMP" => 1611329911731}
    const mapEntryRegex = /{"(?<key>.+)" => (?<value>.+)}/g;

    let match: RegExpExecArray;
    while (match = mapEntryRegex.exec(rawContent)) {
      const key = match.groups['key'];
      const value = match.groups['value'];
      map.set(key, value === 'undefined' ? undefined : JSON.parse(value));
    }
    return map;
  }

  public async enterTitle(title: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error' | ''): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(severity, this._pageFinder.$('select.e2e-severity'));
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(Arrays.coerce(cssClass).join(' '), this._pageFinder.$('input.e2e-class'));
  }

  public async enterActions(actions: Dictionary<string>): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-actions'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(actions);
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(returnValue, this._pageFinder.$('input.e2e-return-value'));
  }
}
