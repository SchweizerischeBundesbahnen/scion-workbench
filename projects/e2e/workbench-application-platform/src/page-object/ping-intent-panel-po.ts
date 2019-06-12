/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { switchToIFrameContext } from '../util/testing.util';

export class PingIntentPanelPO {

  private _panel = $('app-ping-intent-panel');

  constructor(public iframeContext: string[]) {
  }

  public async getResult(): Promise<string> {
    await switchToIFrameContext(this.iframeContext);
    return this._panel.$('output.e2e-result').getText();
  }

  public async clickPingButton(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button.e2e-ping').click();
  }

  public async enterPingMessage(message: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('input.e2e-ping-message').click();
    await this._panel.$('input.e2e-ping-message').sendKeys(message);
  }
}
