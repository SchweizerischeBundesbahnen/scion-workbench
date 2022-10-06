/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, fromRect, isPresent} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {BottomLeftPoint, BottomRightPoint, PopupOrigin, PopupSize, TopLeftPoint, TopRightPoint} from '@scion/workbench';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';

/**
 * Page object to interact {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  private readonly _locator: Locator;
  public readonly view: ViewPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.view = this._appPO.view({viewId});
    this._locator = this.view.locator('app-popup-opener-page');
  }

  public async selectPopupComponent(component: 'popup-page' | 'popup-focus-page' | 'empty-page'): Promise<void> {
    await this._locator.locator('select.e2e-popup-component').selectOption(component);
  }

  public async enterPosition(position: 'element'): Promise<void>;
  public async enterPosition(position: TopLeftPoint): Promise<void>;
  public async enterPosition(position: TopRightPoint): Promise<void>;
  public async enterPosition(position: BottomLeftPoint): Promise<void>;
  public async enterPosition(position: BottomRightPoint): Promise<void>;
  public async enterPosition(position: 'element' | PopupOrigin): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
    try {
      if (position === 'element') {
        await this._locator.locator('select.e2e-position').selectOption('element');
        return;
      }
      const topLeft = position as TopLeftPoint;
      if (topLeft.top !== undefined && topLeft.left !== undefined) {
        await this._locator.locator('select.e2e-position').selectOption('top-left');
        await this._locator.locator('input.e2e-position-vertical').fill(`${topLeft.top}`);
        await this._locator.locator('input.e2e-position-horizontal').fill(`${topLeft.left}`);
        return;
      }
      const topRight = position as TopRightPoint;
      if (topRight.top !== undefined && topRight.right !== undefined) {
        await this._locator.locator('select.e2e-position').selectOption('top-right');
        await this._locator.locator('input.e2e-position-vertical').fill(`${topRight.top}`);
        await this._locator.locator('input.e2e-position-horizontal').fill(`${topRight.right}`);
        return;
      }
      const bottomLeft = position as BottomLeftPoint;
      if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
        await this._locator.locator('select.e2e-position').selectOption('bottom-left');
        await this._locator.locator('input.e2e-position-vertical').fill(`${bottomLeft.bottom}`);
        await this._locator.locator('input.e2e-position-horizontal').fill(`${bottomLeft.left}`);
        return;
      }
      const bottomRight = position as BottomRightPoint;
      if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
        await this._locator.locator('select.e2e-position').selectOption('bottom-right');
        await this._locator.locator('input.e2e-position-vertical').fill(`${bottomRight.bottom}`);
        await this._locator.locator('input.e2e-position-horizontal').fill(`${bottomRight.right}`);
        return;
      }
      throw Error('[PopupOriginError] Illegal popup origin; must be "Element", "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async selectAlign(align: 'east' | 'west' | 'north' | 'south'): Promise<void> {
    await this._locator.locator('select.e2e-align').selectOption(align);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async enterCloseStrategy(options: {closeOnFocusLost?: boolean; closeOnEscape?: boolean}): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-close-strategy'));
    await accordionPO.expand();
    try {
      if (options.closeOnFocusLost !== undefined) {
        await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close-on-focus-lost')).toggle(options.closeOnFocusLost);
      }
      if (options.closeOnEscape !== undefined) {
        await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close-on-escape')).toggle(options.closeOnEscape);
      }
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async expandSizePanel(): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
  }

  public async collapseSizePanel(): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.collapse();
  }

  public async enterPreferredOverlaySize(size: PopupSize): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
    try {
      size.width && await this._locator.locator('input.e2e-width').fill(size.width);
      size.height && await this._locator.locator('input.e2e-height').fill(size.height);
      size.minWidth && await this._locator.locator('input.e2e-min-width').fill(size.minWidth);
      size.maxWidth && await this._locator.locator('input.e2e-max-width').fill(size.maxWidth);
      size.minHeight && await this._locator.locator('input.e2e-min-height').fill(size.minHeight);
      size.maxHeight && await this._locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterPopupInput(input: string): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-input'));
    await accordionPO.expand();
    try {
      await this._locator.locator('input.e2e-input').fill(input);
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterContextualViewId(viewId: string | '<null>' | '<default>'): Promise<void> {
    await this._locator.locator('input.e2e-contextual-view-id').fill(viewId);
  }

  public async clickOpen(options?: {waitForPopup?: boolean}): Promise<void> {
    await this._locator.locator('button.e2e-open').click();

    if (options?.waitForPopup ?? true) {
      // The popup is expected to be opened, but not necessarily in the active view.
      // Therefore, we only wait for it to be attached to the DOM.
      const cssClasses = (await this._locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);
      await this._appPO.popup({cssClass: cssClasses}).waitUntilAttached();
    }
  }

  public async getPopupCloseAction(): Promise<PopupCloseAction> {
    if (await isPresent(this._locator.locator('output.e2e-return-value'))) {
      return {
        type: 'closed-with-value',
        value: await this._locator.locator('output.e2e-return-value').innerText(),
      };
    }
    if (await isPresent(this._locator.locator('output.e2e-popup-error'))) {
      return {
        type: 'closed-with-error',
        value: await this._locator.locator('output.e2e-popup-error').innerText(),
      };
    }
    return {
      type: 'closed',
    };
  }

  public async getAnchorElementClientRect(): Promise<DOMRect> {
    const buttonLocator = this._locator.locator('button.e2e-open');
    return fromRect(await buttonLocator.boundingBox());
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}

