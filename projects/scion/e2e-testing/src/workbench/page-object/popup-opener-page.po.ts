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
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewTab: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.view = this._appPO.view({viewId});
    this.viewTab = this.view.viewTab;
    this.locator = this.view.locate('app-popup-opener-page');
  }

  public async selectPopupComponent(component: 'popup-page' | 'focus-test-page' | 'input-field-test-page' | 'blank-test-page'): Promise<void> {
    await this.locator.locator('select.e2e-popup-component').selectOption(component);
  }

  public async enterPosition(position: 'element'): Promise<void>;
  public async enterPosition(position: TopLeftPoint): Promise<void>;
  public async enterPosition(position: TopRightPoint): Promise<void>;
  public async enterPosition(position: BottomLeftPoint): Promise<void>;
  public async enterPosition(position: BottomRightPoint): Promise<void>;
  public async enterPosition(position: 'element' | PopupOrigin): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-anchor'));
    await accordion.expand();
    try {
      if (position === 'element') {
        await this.locator.locator('select.e2e-position').selectOption('element');
        return;
      }
      const topLeft = position as TopLeftPoint;
      if (topLeft.top !== undefined && topLeft.left !== undefined) {
        await this.locator.locator('select.e2e-position').selectOption('top-left');
        await this.locator.locator('input.e2e-position-vertical').fill(`${topLeft.top}`);
        await this.locator.locator('input.e2e-position-horizontal').fill(`${topLeft.left}`);
        return;
      }
      const topRight = position as TopRightPoint;
      if (topRight.top !== undefined && topRight.right !== undefined) {
        await this.locator.locator('select.e2e-position').selectOption('top-right');
        await this.locator.locator('input.e2e-position-vertical').fill(`${topRight.top}`);
        await this.locator.locator('input.e2e-position-horizontal').fill(`${topRight.right}`);
        return;
      }
      const bottomLeft = position as BottomLeftPoint;
      if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
        await this.locator.locator('select.e2e-position').selectOption('bottom-left');
        await this.locator.locator('input.e2e-position-vertical').fill(`${bottomLeft.bottom}`);
        await this.locator.locator('input.e2e-position-horizontal').fill(`${bottomLeft.left}`);
        return;
      }
      const bottomRight = position as BottomRightPoint;
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
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordion.expand();
  }

  public async collapseSizePanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordion.collapse();
  }

  public async enterPreferredOverlaySize(size: PopupSize): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-preferred-overlay-size'));
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

  public async enterContextualViewId(viewId: string | '<null>' | '<default>'): Promise<void> {
    await this.locator.locator('input.e2e-contextual-view-id').fill(viewId);
  }

  public async clickOpen(): Promise<void> {
    await this.locator.locator('button.e2e-open').click();
    const cssClasses = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);
    await this._appPO.popup({cssClass: cssClasses}).waitUntilAttached();
  }

  public async getPopupCloseAction(): Promise<PopupCloseAction> {
    if (await isPresent(this.locator.locator('output.e2e-return-value'))) {
      return {
        type: 'closed-with-value',
        value: await this.locator.locator('output.e2e-return-value').innerText(),
      };
    }
    if (await isPresent(this.locator.locator('output.e2e-popup-error'))) {
      return {
        type: 'closed-with-error',
        value: await this.locator.locator('output.e2e-popup-error').innerText(),
      };
    }
    return {
      type: 'closed',
    };
  }

  public async getAnchorElementClientRect(): Promise<DOMRect> {
    const buttonLocator = this.locator.locator('button.e2e-open');
    return fromRect(await buttonLocator.boundingBox());
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}

