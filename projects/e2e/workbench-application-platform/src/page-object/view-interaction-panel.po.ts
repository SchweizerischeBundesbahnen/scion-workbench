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
import { checkCheckbox, switchToIFrameContext } from '../util/testing.util';

export class ViewInteractionPanelPO {

  private _panel = $('app-view-interaction-panel');

  constructor(public iframeContext: string[]) {
  }

  public async enterTitle(title: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#title');
    await inputField.clear();
    await inputField.sendKeys(title);
    return Promise.resolve();
  }

  public async enterHeading(heading: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#heading');
    await inputField.clear();
    await inputField.sendKeys(heading);
    return Promise.resolve();
  }

  public async markDirty(dirty: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const checkboxField = this._panel.$('input#dirty');
    await checkCheckbox(dirty, checkboxField);
    return Promise.resolve();
  }

  public async setClosable(closable: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const checkboxField = this._panel.$('input#closable');
    await checkCheckbox(closable, checkboxField);
    return Promise.resolve();
  }

  public async close(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button#close').click();
  }

  public async getActiveLog(): Promise<boolean[]> {
    await switchToIFrameContext(this.iframeContext);
    const activeLog: string = await this._panel.$('textarea#active-log').getAttribute('value');
    return activeLog.split(/\s+/).map(activeLogEntry => JSON.parse(activeLogEntry));
  }
}
