/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, isPresent, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewTabPO} from '../../view-tab.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';

/**
 * Page object to interact with {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewTab: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.view = this._appPO.view({viewId});
    this.viewTab = this.view.viewTab;
    this.locator = this.view.locate('app-message-box-opener-page');
  }

  public async selectComponent(component: 'inspect-message-box' | 'default'): Promise<void> {
    await this.locator.locator('select.e2e-component').selectOption(component);
  }

  public async enterContent(content: string): Promise<void> {
    await this.locator.locator('input.e2e-content').fill(content);
  }

  public async enterComponentInput(componentInput: string): Promise<void> {
    await this.locator.locator('input.e2e-component-input').fill(componentInput);
  }

  public async enterTitle(title: string): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async clickTitle(): Promise<void> {
    await this.locator.locator('input.e2e-title').click({timeout: 1000});
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await this.locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectModality(modality: 'view' | 'application'): Promise<void> {
    await this.locator.locator('select.e2e-modality').selectOption(modality);
  }

  public async enterContextualViewId(contextualViewId: string): Promise<void> {
    await this.locator.locator('input.e2e-contextual-view-id').fill(contextualViewId);
  }

  public async checkContentSelectable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-content-selectable')).toggle(check);
  }

  public async checkViewContextActive(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-view-context')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async enterCount(count: number): Promise<void> {
    await this.locator.locator('input.e2e-count').fill(`${count}`);
  }

  public async enterActions(actions: Record<string, string>): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-actions'));
    await keyValueField.clear();
    await keyValueField.addEntries(actions);
  }

  public async clickOpen(): Promise<void> {
    const count = Number(await this.locator.locator('input.e2e-count').inputValue() || 1);
    const cssClasses = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);

    await this.locator.locator('button.e2e-open').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      Promise.all(Array.from(Array(count).keys()).map(i => this._appPO.messagebox({cssClass: [`index-${i}`].concat(cssClasses)}).waitUntilAttached())),
      rejectWhenAttached(this.locator.locator('output.e2e-open-error')),
    ]);
  }

  public async getMessageBoxCloseAction(): Promise<string> {
    return this.locator.locator('output.e2e-close-action').innerText();
  }

  public async isPresent(): Promise<boolean> {
    return await this.viewTab.isPresent() && await isPresent(this.locator);
  }
}

