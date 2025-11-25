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
import {BottomLeftPoint, BottomRightPoint, CloseStrategy, TopLeftPoint, TopRightPoint, WorkbenchPopupOptions} from '@scion/workbench';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {PopupPO} from '../../popup.po';
import {DialogPO} from '../../dialog.po';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {PartPO} from '../../part.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {WorkbenchDialogPagePO} from './workbench-dialog-page.po';
import {WorkbenchPopupPagePO} from './workbench-popup-page.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly openButton: Locator;
  public readonly returnValue: Locator;
  public readonly error: Locator;

  constructor(private _locateBy: ViewPO | PartPO | PopupPO | DialogPO) {
    this.locator = this._locateBy.locator.locator('app-popup-opener-page');
    this.openButton = this.locator.locator('button.e2e-open');
    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-popup-error');
  }

  public async open(component: 'popup-page' | 'focus-test-page' | 'input-field-test-page' | 'blank-test-page' | 'size-test-page' | 'popup-opener-page' | 'dialog-opener-page', options: PopupOpenerPageOptions & Omit<WorkbenchPopupOptions, 'anchor' | 'size'>): Promise<void> {
    if (options.injector) {
      throw Error('[PageObjectError] PageObject does not support the option `injector`.');
    }
    if (options.providers) {
      throw Error('[PageObjectError] PageObject does not support the option `providers`.');
    }

    // Select API.
    const legacyAPI = options.legacyAPI ?? false;
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-legacy-api')).toggle(legacyAPI);

    // Enter component.
    await this.locator.locator('select.e2e-popup-component').selectOption(component);

    // Enter anchor.
    if (options.anchor === 'element') {
      await this.locator.locator('select.e2e-position').selectOption('element');
    }
    else {
      await this.enterPosition(options.anchor);
    }

    // Enter align.
    await this.locator.locator('select.e2e-align').selectOption(options.align ?? '');

    // Enter inputs
    if (legacyAPI) {
      await this.locator.locator('input.e2e-input').fill(options.inputLegacy ?? '');
    }
    else {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-inputs'));
      await keyValueField.clear();
      await keyValueField.addEntries(options.inputs ?? {});
    }

    // Enter context.
    const context = options.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
    await this.locator.locator('input.e2e-context').fill(context || (context === null ? '<null>' : '<undefined>'));

    // Enter CSS class.
    await this.locator.locator('input.e2e-class').fill(coerceArray(options.cssClass).join(' '));

    // Enter close strategy.
    await this.enterCloseStrategy(options.closeStrategy ?? {});

    // Enter size.
    await this.enterSize(options.size ?? {});

    // Open popup.
    await this.openButton.click();

    if (options.waitUntilAttached ?? true) {
      // Evaluate the response: resolve the promise on success, or reject it on error.
      await Promise.race([
        this.waitUntilPopupAttached(),
        rejectWhenAttached(this.error),
      ]);
    }
  }

  public async enterPosition(position: TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> {
    const topLeft = position as Partial<TopLeftPoint>;
    if (topLeft.top !== undefined && topLeft.left !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('top-left');
      await this.locator.locator('input.e2e-position-vertical').fill(`${topLeft.top}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${topLeft.left}`);
      return;
    }
    const topRight = position as Partial<TopRightPoint>;
    if (topRight.top !== undefined && topRight.right !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('top-right');
      await this.locator.locator('input.e2e-position-vertical').fill(`${topRight.top}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${topRight.right}`);
      return;
    }
    const bottomLeft = position as Partial<BottomLeftPoint>;
    if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('bottom-left');
      await this.locator.locator('input.e2e-position-vertical').fill(`${bottomLeft.bottom}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${bottomLeft.left}`);
      return;
    }
    const bottomRight = position as Partial<BottomRightPoint>;
    if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('bottom-right');
      await this.locator.locator('input.e2e-position-vertical').fill(`${bottomRight.bottom}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${bottomRight.right}`);
      return;
    }
    throw Error('[PopupOriginError] Illegal popup origin; must be "Element", "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
  }

  private async enterCloseStrategy(options: CloseStrategy): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-close-strategy'));
    await accordion.expand();
    try {
      if (options.onFocusLost !== undefined) {
        await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-on-focus-lost')).toggle(options.onFocusLost);
      }
      if (options.onEscape !== undefined) {
        await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-on-escape')).toggle(options.onEscape);
      }
    }
    finally {
      await accordion.collapse();
    }
  }

  private async enterSize(size: WorkbenchPopupSize): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.expand();
    try {
      await this.locator.locator('input.e2e-width').fill(size.width ?? '');
      await this.locator.locator('input.e2e-height').fill(size.height ?? '');
      await this.locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
      await this.locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
      await this.locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
      await this.locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
    }
    finally {
      await accordion.collapse();
    }
  }

  public async expandPanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.expand();
  }

  public async collapsePanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.collapse();
  }

  private async waitUntilPopupAttached(): Promise<void> {
    const cssClass = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);
    const popup = new AppPO(this.locator.page()).popup({cssClass});
    await popup.locator.waitFor({state: 'attached'});
  }

  public async click(options?: {timeout?: number}): Promise<void> {
    await this.locator.click(options);
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
}

/**
 * Controls opening of a popup.
 */
export interface PopupOpenerPageOptions {
  /**
   * Controls if to wait for the popup to display.
   */
  waitUntilAttached?: boolean;
  /**
   * @see WorkbenchPopupOptions.anchor
   */
  anchor: 'element' | TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint;
  /**
   * Controls if to use the legacy Workbench Popup API.
   *
   * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
   */
  legacyAPI?: true;
  /**
   * Input data if using the legacy Workbench Popup API.
   *
   * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
   */
  inputLegacy?: string;
  /**
   * Controls at which size to open the popup.
   */
  size?: WorkbenchPopupSize;
}

export interface WorkbenchPopupSize {
  minHeight?: string;
  height?: string;
  maxHeight?: string;
  minWidth?: string;
  width?: string;
  maxWidth?: string;
}
