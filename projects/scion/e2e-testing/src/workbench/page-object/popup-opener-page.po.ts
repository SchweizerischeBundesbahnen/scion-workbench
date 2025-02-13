/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, DomRect, fromRect, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {BottomLeftPoint, BottomRightPoint, PopupSize, TopLeftPoint, TopRightPoint, ViewId} from '@scion/workbench';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {PopupPO} from '../../popup.po';
import {DialogPO} from '../../dialog.po';
import {WorkbenchViewPagePO} from './workbench-view-page.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly returnValue: Locator;
  public readonly error: Locator;
  public readonly openButton: Locator;

  constructor(private _locateBy: ViewPO | PopupPO | DialogPO) {
    this.locator = this._locateBy.locator.locator('app-popup-opener-page');
    this.openButton = this.locator.locator('button.e2e-open');
    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-popup-error');
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

  public async selectPopupComponent(component: 'popup-page' | 'focus-test-page' | 'input-field-test-page' | 'blank-test-page' | 'size-test-page' | 'popup-opener-page' | 'dialog-opener-page'): Promise<void> {
    await this.locator.locator('select.e2e-popup-component').selectOption(component);
  }

  public async enterPosition(position: 'element' | TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-anchor'));
    await accordion.expand();
    try {
      if (position === 'element') {
        await this.locator.locator('select.e2e-position').selectOption('element');
        return;
      }
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
    finally {
      await accordion.collapse();
    }
  }

  public async selectAlign(align: 'east' | 'west' | 'north' | 'south'): Promise<void> {
    await this.locator.locator('select.e2e-align').selectOption(align);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async enterCloseStrategy(options: {closeOnFocusLost?: boolean; closeOnEscape?: boolean}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-close-strategy'));
    await accordion.expand();
    try {
      if (options.closeOnFocusLost !== undefined) {
        await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-on-focus-lost')).toggle(options.closeOnFocusLost);
      }
      if (options.closeOnEscape !== undefined) {
        await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-on-escape')).toggle(options.closeOnEscape);
      }
    }
    finally {
      await accordion.collapse();
    }
  }

  public async expandSizePanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.expand();
  }

  public async collapseSizePanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.collapse();
  }

  public async enterSize(size: PopupSize): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    await accordion.expand();
    try {
      size.width && await this.locator.locator('input.e2e-width').fill(size.width);
      size.height && await this.locator.locator('input.e2e-height').fill(size.height);
      size.minWidth && await this.locator.locator('input.e2e-min-width').fill(size.minWidth);
      size.maxWidth && await this.locator.locator('input.e2e-max-width').fill(size.maxWidth);
      size.minHeight && await this.locator.locator('input.e2e-min-height').fill(size.minHeight);
      size.maxHeight && await this.locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterPopupInput(input: string): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-input'));
    await accordion.expand();
    try {
      await this.locator.locator('input.e2e-input').fill(input);
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterContextualViewId(viewId: ViewId | '<null>' | ''): Promise<void> {
    await this.locator.locator('input.e2e-contextual-view-id').fill(viewId);
  }

  public async open(options?: {waitUntilAttached?: boolean}): Promise<void> {
    await this.locator.locator('button.e2e-open').click();

    if (!(options?.waitUntilAttached ?? true)) {
      return;
    }

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this.waitUntilPopupAttached(),
      rejectWhenAttached(this.error),
    ]);
  }

  private async waitUntilPopupAttached(): Promise<void> {
    const cssClass = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);
    const popup = new AppPO(this.locator.page()).popup({cssClass});
    await popup.locator.waitFor({state: 'attached'});
  }

  public async getAnchorElementBoundingBox(): Promise<DomRect> {
    return fromRect(await this.openButton.boundingBox());
  }

  public async click(options?: {timeout?: number}): Promise<void> {
    await this.locator.click(options);
  }
}
