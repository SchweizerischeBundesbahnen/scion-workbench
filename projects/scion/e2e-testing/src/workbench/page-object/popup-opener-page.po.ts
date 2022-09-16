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
import {AppPO, ViewTabPO} from '../../app.po';
import {PopupOrigin, PopupSize} from '@scion/workbench';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  private readonly _locator: Locator;
  public readonly viewTabPO: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._locator = this._appPO.findView({viewId: viewId}).locator('app-popup-opener-page');
  }

  public async selectPopupComponent(component: 'popup-page' | 'popup-focus-page'): Promise<void> {
    await this._locator.locator('select.e2e-popup-component').selectOption(component);
  }

  public async selectAnchor(anchor: 'element' | 'coordinate'): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
    try {
      await this._locator.locator('select.e2e-anchor').selectOption(anchor);
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterAnchorCoordinate(coordinate: PopupOrigin): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
    try {
      if (coordinate.x !== undefined) {
        await this._locator.locator('input.e2e-anchor-x').fill(`${coordinate.x}`);
      }
      if (coordinate.y !== undefined) {
        await this._locator.locator('input.e2e-anchor-y').fill(`${coordinate.y}`);
      }
      if (coordinate.width !== undefined) {
        await this._locator.locator('input.e2e-anchor-width').fill(`${coordinate.width}`);
      }
      if (coordinate.height !== undefined) {
        await this._locator.locator('input.e2e-anchor-height').fill(`${coordinate.height}`);
      }
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

  public async enterContextualViewId(viewId: string | '<null>'): Promise<void> {
    await this._locator.locator('input.e2e-contextual-view-id').fill(viewId);
  }

  public async clickOpen(): Promise<void> {
    await this._locator.locator('button.e2e-open').click();
    // The popup is expected to be opened, but not necessarily in the active view.
    // Therefore, we only wait for it to be attached to the DOM.
    await this._appPO.popupLocator().waitFor({state: 'attached'});
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

