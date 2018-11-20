/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { switchToIFrameContext } from '../util/testing.util';

export class ActivityInteractionPanelPO {

  private _panel = $('app-activity-interaction-panel');

  constructor(public iframeContext: string[]) {
  }

  public async enterTitle(title: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#title');
    await inputField.clear();
    await inputField.sendKeys(title);
    return Promise.resolve();
  }

  public async enterItemText(itemText: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#item-text');
    await inputField.clear();
    await inputField.sendKeys(itemText);
    return Promise.resolve();
  }

  public async enterItemCssClass(itemCssClass: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#item-css-class');
    await inputField.clear();
    await inputField.sendKeys(itemCssClass);
    return Promise.resolve();
  }

  public async enterDeltaPx(deltaPx: number): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#panel-width-delta');
    await inputField.clear();
    await inputField.sendKeys(deltaPx);
    return Promise.resolve();
  }

  public async getActiveLog(): Promise<boolean[]> {
    await switchToIFrameContext(this.iframeContext);
    const activeLog: string = await this._panel.$('textarea#active-log').getAttribute('value');
    return activeLog.split(/\s+/).map(activeLogEntry => JSON.parse(activeLogEntry));
  }
}
