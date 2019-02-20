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

export class CustomIntentPanelPO {

  private _panel = $('app-custom-intent-panel');

  constructor(public iframeContext: string[]) {
  }

  public async getResult(): Promise<string> {
    await switchToIFrameContext(this.iframeContext);
    return this._panel.$('output.e2e-result').getText();
  }

  public async issueIntent(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button.e2e-issue-intent').click();
  }
}
