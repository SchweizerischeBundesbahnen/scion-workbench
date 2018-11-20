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
import { checkCheckbox, selectOption, switchToIFrameContext } from '../util/testing.util';
import { Qualifier } from '@scion/workbench-application-platform.api';
import { Params } from '@angular/router';
import { SciParamsEnterPanelPO } from './sci-params-enter.po';
import { SciPropertyPanelPO } from './sci-property.po';

export class PopupPanelPO {

  private _panel = $('app-popup-panel');

  constructor(public iframeContext: string[]) {
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciParamsEnterPanelPO().enterParams(qualifier, this._panel.$('.e2e-qualifier-panel'));
  }

  public async enterMatrixParams(params: Params): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciParamsEnterPanelPO().enterParams(params, this._panel.$('.e2e-matrix-params-panel'));
  }

  public async enterQueryParams(params: Params): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciParamsEnterPanelPO().enterParams(params, this._panel.$('.e2e-query-params-panel'));
  }

  public async selectPosition(value: 'north' | 'east' | 'south' | 'west'): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await selectOption(value, this._panel.$('select#position'));
  }

  public async checkCloseOnFocusLost(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#onFocusLost'));
  }

  public async checkCloseOnEscape(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#onEscape'));
  }

  public async checkCloseOnGridLayoutChange(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#onGridLayoutChange'));
  }

  public async execute(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button.e2e-execute').click();
  }

  public async getResult(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(this.iframeContext);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-result'));
  }
}
