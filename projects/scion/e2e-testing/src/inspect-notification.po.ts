/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO, NotificationPO } from './app.po';
import { ElementFinder } from 'protractor';
import { WebdriverExecutionContexts } from './helper/webdriver-execution-context';

/**
 * Page object to interact {@link InspectNotificationComponent}.
 */
export class InspectNotificationPO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly notificationPO: NotificationPO;

  constructor(public cssClass: string) {
    this.notificationPO = this._appPO.findNotification({cssClass: cssClass});
    this._pageFinder = this.notificationPO.$('app-inspect-notification');
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return await this.notificationPO.isDisplayed() && await this._pageFinder.isDisplayed();
  }

  public async getInput(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.$('output.e2e-input').getText();
  }

  public async getContent(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.$('output.e2e-e2e-content').getText();
  }

  public async getInputAsMap(): Promise<Map<string, any>> {
    await WebdriverExecutionContexts.switchToDefault();
    const rawContent = await this.getInput();
    const map = new Map();

    // Sample Map content:
    // '{"$implicit" => undefined}\n' +
    // '{"component" => "inspector"}\n' +
    // '{"ɵAPP_SYMBOLIC_NAME" => "workbench-client-testing-app1"}\n' +
    // '{"ɵCLIENT_ID" => "ff94819f-0b89-42da-8ed4-843698041b2a"}\n' +
    // '{"ɵMESSAGE_ID" => "f12d4268-cd79-4356-ac5f-4e4e62a6e87e"}\n' +
    // '{"ɵREPLY_TO" => "d28233aa-566b-4696-b225-07e35b1d50b6"}\n' +
    // '{"ɵTIMESTAMP" => 1611329911731}';
    const mapEntryRegex = /{"(?<key>.+)" => (?<value>.+)}/g;

    let match: RegExpExecArray;
    while (match = mapEntryRegex.exec(rawContent)) { // tslint:disable-line:no-conditional-assignment
      const key = match.groups['key'];
      const value = match.groups['value'];
      map.set(key, value === 'undefined' ? undefined : JSON.parse(value));
    }
    return map;
  }
}
