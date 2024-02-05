/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {WorkbenchMessageBoxOptions} from '@scion/workbench';
import {WorkbenchViewPagePO} from './workbench-view-page.po';

/**
 * Page object to interact with {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly closeAction: Locator;
  public readonly error: Locator;
  public readonly view: ViewPO;
  private readonly _openButton: Locator;

  constructor(private _appPO: AppPO, locateBy: {viewId?: string; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-message-box-opener-page');
    this.closeAction = this.locator.locator('output.e2e-close-action');
    this.error = this.locator.locator('output.e2e-message-box-error');
    this._openButton = this.locator.locator('button.e2e-open');
  }

  public async open(message: string, options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(component: 'component:message-box-page', options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(content: string | 'component:message-box-page', options?: WorkbenchMessageBoxOptions): Promise<void> {
    if (options?.injector) {
      throw Error('[PageObjectError] PageObject does not support the option `injector`.');
    }
    if (options?.context) {
      throw Error('[PageObjectError] PageObject does not support the option `context`.');
    }

    const componentMatch = content.match(/^component:(?<component>.+)$/);
    if (componentMatch) {
      await this.locator.locator('select.e2e-component').selectOption(componentMatch.groups!['component']!);
    }
    else {
      await this.locator.locator('input.e2e-message').fill(content);
    }

    if (options?.inputs) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-inputs'));
      await keyValueField.clear();
      await keyValueField.addEntries(options.inputs);
    }

    if (options?.title) {
      await this.locator.locator('input.e2e-title').fill(options.title);
    }

    if (options?.actions) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-actions'));
      await keyValueField.clear();
      await keyValueField.addEntries(options.actions);
    }

    if (options?.severity) {
      await this.locator.locator('select.e2e-severity').selectOption(options.severity);
    }

    if (options?.modality) {
      await this.locator.locator('select.e2e-modality').selectOption(options.modality);
    }

    if (options?.contentSelectable) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-content-selectable')).toggle(options.contentSelectable);
    }

    if (options?.cssClass) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(options.cssClass).join(' '));
    }

    await this._openButton.click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this.waitUntilMessageBoxAttached(options),
      rejectWhenAttached(this.error),
    ]);
  }

  private async waitUntilMessageBoxAttached(options?: WorkbenchMessageBoxOptions): Promise<void> {
    const cssClass = coerceArray(options?.cssClass).filter(Boolean);
    const messagebox = this._appPO.messagebox({cssClass});
    await messagebox.locator.waitFor({state: 'attached'});
  }
}
