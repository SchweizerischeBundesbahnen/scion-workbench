/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO, NotificationPO} from './app.po';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from './helper/webdriver-execution-context';

/**
 * Page object to interact {@link TextNotificationComponent}.
 */
export class TextNotificationPO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly notificationPO: NotificationPO;

  constructor(public cssClass: string) {
    this.notificationPO = this._appPO.findNotification({cssClass: cssClass});
    this._pageFinder = this.notificationPO.$('wb-text-notification');
  }

  public async isDisplayed(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return await this.notificationPO.isDisplayed() && await this._pageFinder.isDisplayed();
  }

  public async getText(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.getText();
  }
}
