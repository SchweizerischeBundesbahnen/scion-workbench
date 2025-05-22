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
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {DialogPO} from '../../dialog.po';
import {PopupPO} from '../../popup.po';
import {WorkbenchDialogOptions} from '@scion/workbench';
import {WorkbenchViewPagePO} from './workbench-view-page.po';

/**
 * Page object to interact with {@link DialogOpenerPageComponent}.
 */
export class DialogOpenerPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly returnValue: Locator;
  public readonly error: Locator;
  public readonly openButton: Locator;

  constructor(private _locateBy: ViewPO | PopupPO | DialogPO) {
    this.locator = this._locateBy.locator.locator('app-dialog-opener-page');
    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-dialog-error');
    this.openButton = this.locator.locator('button.e2e-open');
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get popup(): PopupPO {
    if (this._locateBy instanceof PopupPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a popup.');
    }
  }

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
    }
  }

  public async open(component: 'dialog-page' | 'dialog-opener-page' | 'popup-opener-page' | 'focus-test-page' | 'input-field-test-page' | 'size-test-page', options?: WorkbenchDialogOptions & DialogOpenerPageOptions): Promise<void> {
    if (options?.injector) {
      throw Error('[PageObjectError] PageObject does not support the option `injector`.');
    }

    await this.locator.locator('select.e2e-component').selectOption(component);

    if (options?.inputs) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-inputs'));
      await keyValueField.clear();
      await keyValueField.addEntries(options.inputs);
    }

    if (options?.modality) {
      await this.locator.locator('select.e2e-modality').selectOption(options.modality);
    }

    if (options?.context?.viewId) {
      await this.locator.locator('input.e2e-contextual-view-id').fill(options.context.viewId);
    }

    if (options?.cssClass) {
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(options.cssClass).join(' '));
    }

    if (options?.animate !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-animate')).toggle(options.animate);
    }

    if (options?.count) {
      await this.locator.locator('input.e2e-count').fill(`${options.count}`);
    }

    if (options?.viewContextActive !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-view-context')).toggle(options.viewContextActive);
    }

    await this.openButton.click();

    if (options?.waitUntilOpened ?? true) {
      // Evaluate the response: resolve the promise on success, or reject it on error.
      await Promise.race([
        this.waitUntilDialogsAttached(options),
        rejectWhenAttached(this.error),
      ]);
    }
  }

  public async click(options?: {timeout?: number}): Promise<void> {
    await this.locator.click(options);
  }

  private async waitUntilDialogsAttached(options?: WorkbenchDialogOptions & DialogOpenerPageOptions): Promise<void> {
    const cssClasses = coerceArray(options?.cssClass).filter(Boolean);

    for (let i = 0; i < (options?.count ?? 1); i++) {
      const dialog = new AppPO(this.locator.page()).dialog({cssClass: [`index-${i}`].concat(cssClasses)});
      await dialog.locator.waitFor({state: 'attached'});
    }
  }
}

export interface DialogOpenerPageOptions {
  count?: number;
  viewContextActive?: boolean;
  waitUntilOpened?: boolean;
}
