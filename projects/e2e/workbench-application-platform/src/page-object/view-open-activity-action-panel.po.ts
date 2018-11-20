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
import { Qualifier } from '@scion/workbench-application-platform.api';
import { Params } from '@angular/router';
import { SciParamsEnterPanelPO } from './sci-params-enter.po';

export class ViewOpenActivityActionPanelPO {

  private _panel = $('app-view-open-activity-action-panel');

  constructor(public iframeContext: string[]) {
  }

  public async enterLabel(label: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#label');
    await inputField.clear();
    await inputField.sendKeys(label);
    return Promise.resolve();
  }

  public async enterTitle(label: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#title');
    await inputField.clear();
    await inputField.sendKeys(label);
    return Promise.resolve();
  }

  public async enterCssClass(cssClass: string): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    const inputField = this._panel.$('input#css-class');
    await inputField.clear();
    await inputField.sendKeys(cssClass);
    return Promise.resolve();
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

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#activateIfPresent'));
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('#closeIfPresent'));
  }

  public async addAction(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await this._panel.$('button.e2e-add-action').click();
  }
}
