/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {MessageBoxPO} from './message-box.po';
import {coerceArray, isPresent} from './helper/testing.util';
import {SciKeyValueFieldPO} from './@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link InspectMessageBoxComponent}.
 */
export class InspectMessageBoxPO {

  private readonly _locator: Locator;

  public readonly msgboxPO: MessageBoxPO;

  constructor(appPO: AppPO, public cssClass: string) {
    this.msgboxPO = appPO.messagebox({cssClass: cssClass});
    this._locator = this.msgboxPO.locator('app-inspect-message-box');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }

  public async getComponentInstanceId(): Promise<string> {
    return this._locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getInput(): Promise<string> {
    return this._locator.locator('output.e2e-input').innerText();
  }

  public async getInputAsKeyValueObject(): Promise<Record<string, any>> {
    const rawContent = await this.getInput();
    const dictionary: Record<string, any> = {};

    // Sample Map content:
    // {"$implicit" => undefined}
    // {"component" => "inspector"}
    // {"ɵAPP_SYMBOLIC_NAME" => "workbench-client-testing-app1"}
    // {"ɵCLIENT_ID" => "ff94819f-0b89-42da-8ed4-843698041b2a"}
    // {"ɵMESSAGE_ID" => "f12d4268-cd79-4356-ac5f-4e4e62a6e87e"}
    // {"ɵREPLY_TO" => "d28233aa-566b-4696-b225-07e35b1d50b6"}
    // {"ɵTIMESTAMP" => 1611329911731}
    const mapEntryRegex = /{"(?<key>.+)" => (?<value>.+)}/g;

    let match: RegExpExecArray | null;
    while (match = mapEntryRegex.exec(rawContent)) { // eslint-disable-line no-cond-assign
      const key = match.groups!['key'];
      const value = match.groups!['value'];
      dictionary[key] = value === 'undefined' ? undefined : JSON.parse(value);
    }
    return dictionary;
  }

  public async enterTitle(title: string): Promise<void> {
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error' | ''): Promise<void> {
    await this._locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async enterActions(actions: Record<string, string>): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-actions'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(actions);
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    await this._locator.locator('input.e2e-return-value').fill(returnValue);
  }
}
