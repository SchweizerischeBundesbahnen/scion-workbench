/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewTabPO} from '../../view-tab.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO {

  private readonly _locator: Locator;

  public readonly viewTabPO: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.viewTabPO = _appPO.view({viewId}).viewTab;
    this._locator = _appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-message-box-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterTitle(title: string): Promise<void> {
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async enterContent(content: string): Promise<void> {
    await this._locator.locator('input.e2e-content').fill(content);
  }

  public async enterActions(actions: Record<string, string>): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-actions'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(actions);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await this._locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectModality(modality: 'view' | 'application'): Promise<void> {
    await this._locator.locator('select.e2e-modality').selectOption(modality);
  }

  public async checkContentSelectable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-content-selectable')).toggle(check);
  }

  public async checkViewContextActive(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-view-context')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async clickOpen(): Promise<void> {
    await this._locator.locator('button.e2e-open').click();
    const cssClasses = (await this._locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const errorLocator = this._locator.locator('output.e2e-open-error');
    return Promise.race([
      this._appPO.messagebox({cssClass: cssClasses}).waitUntilAttached(),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }

  public async getMessageBoxCloseAction(): Promise<string> {
    return this._locator.locator('output.e2e-close-action').innerText();
  }
}
