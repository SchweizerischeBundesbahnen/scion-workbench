/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, isPresent, rejectWhenAttached, waitUntilBoundingBoxStable} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {BottomLeftPoint, BottomRightPoint, PopupOrigin, TopLeftPoint, TopRightPoint} from '@scion/workbench';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {ViewTabPO} from '../../view-tab.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewTab: ViewTabPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.view = _appPO.view({viewId});
    this.viewTab = this.view.viewTab;
    this.outlet = new SciRouterOutletPO(_appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-popup-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueField.clear();
    await keyValueField.addEntries(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
    await keyValueField.clear();
    await keyValueField.addEntries(params);
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

  public async enterContextualViewId(viewId: string | '<null>' | '<default>'): Promise<void> {
    await this.locator.locator('input.e2e-contextual-view-id').fill(viewId);
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

  public async expandAnchorPanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-anchor'));
    await accordion.expand();
  }

  public async collapseAnchorPanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-anchor'));
    await accordion.collapse();
  }

  public async clickOpen(): Promise<void> {
    await this.locator.locator('button.e2e-open').click();
    const cssClasses = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this._appPO.popup({cssClass: cssClasses}).waitUntilAttached(),
      rejectWhenAttached(this.locator.locator('output.e2e-popup-error')),
    ]);
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
    return waitUntilBoundingBoxStable(buttonLocator);
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}
