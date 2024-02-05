/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NotificationPO} from './notification.po';
import {coerceArray} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {WorkbenchNotificationPagePO} from './workbench/page-object/workbench-notification-page.po';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationPagePO implements WorkbenchNotificationPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;

  constructor(public notification: NotificationPO) {
    this.locator = this.notification.locator.locator('app-notification-page');
    this.input = this.locator.locator('output.e2e-input');
  }

  public async getInputAsKeyValueObject(): Promise<Record<string, any>> {
    const rawContent = await this.input.innerText();
    const dictionary: Record<string, any> = {};

    // Sample Map content:
    // {"$implicit" => undefined}
    // {"component" => "notification-page"}
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
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error' | ''): Promise<void> {
    await this.locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | '' | number): Promise<void> {
    await this.locator.locator('input.e2e-duration').fill(`${duration}`);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }
}

