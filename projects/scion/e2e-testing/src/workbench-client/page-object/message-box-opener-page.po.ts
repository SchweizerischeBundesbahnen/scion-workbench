/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewTabPO} from '../../view-tab.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
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

  public waitUntilAttached(): Promise<void> {
    return this._locator.waitFor({state: 'attached'});
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-params'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(params);
  }

  public async enterTitle(title: string): Promise<void> {
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async enterContent(content: string): Promise<void> {
    await this._locator.locator('input.e2e-content').fill(content);
  }

  public async enterActions(actions: Record<string, string>): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-actions'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(actions);
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
    return Promise.race([
      this._appPO.messagebox({cssClass: cssClasses}).waitUntilAttached(),
      rejectWhenAttached(this._locator.locator('output.e2e-open-error')),
    ]);
  }

  public async getMessageBoxCloseAction(): Promise<string> {
    return this._locator.locator('output.e2e-close-action').innerText();
  }
}
