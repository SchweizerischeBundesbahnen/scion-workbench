/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitForCondition, waitUntilBoundingBoxStable, waitUntilStable} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {BottomLeftPoint, BottomRightPoint, CloseStrategy, DialogId, PartId, PopupId, TopLeftPoint, TopRightPoint, ViewId, WorkbenchPopupOptions} from '@scion/workbench-client';
import {PartPO} from '../../part.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly part: PartPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly returnValue: Locator;
  public readonly error: Locator;
  public readonly openButton: Locator;

  constructor(private _appPO: AppPO, locateBy: {id?: ViewId | PartId | DialogId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.id as ViewId | undefined, cssClass: locateBy.cssClass});
    this.part = this._appPO.part({partId: locateBy.id as PartId | undefined, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.id, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-popup-opener-page');
    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-popup-error');
    this.openButton = this.locator.locator('button.e2e-open');
  }

  public async open(qualifier: Qualifier, options: PopupOpenerPageOptions & Omit<WorkbenchPopupOptions, 'anchor'>): Promise<void> {
    // Enter qualifier.
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();
    await qualifierField.addEntries(qualifier);

    // Enter parameters.
    const paramsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
    await paramsField.clear();
    await paramsField.addEntries(options.params ?? {});

    // Enter anchor.
    if (options.anchor === 'element') {
      await this.locator.locator('select.e2e-position').selectOption('element');
    }
    else {
      await this.enterPosition(options.anchor);
    }

    // Enter align.
    await this.locator.locator('select.e2e-align').selectOption(options.align ?? '');

    // Enter context.
    const context = options.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
    await this.locator.locator('input.e2e-context').fill(context || (context === null ? '<null>' : '<undefined>'));

    // Enter CSS classes.
    await this.locator.locator('input.e2e-class').fill(coerceArray(options.cssClass).join(' '));

    // Enter close strategy.
    await this.enterCloseStrategy(options.closeStrategy ?? {});

    // Open popup.
    const popupCount = await this._appPO.popups.count();
    await this.openButton.click();

    if (options.waitUntilAttached ?? true) {
      // Evaluate the response: resolve the promise on success, or reject it on error.
      await Promise.race([
        this.waitUntilPopupAttached(popupCount),
        rejectWhenAttached(this.error),
      ]);
    }
  }

  public async enterPosition(position: 'element' | TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> {
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

  public async expandPanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-close-strategy'));
    await accordion.expand();
  }

  public async collapsePanel(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-close-strategy'));
    await accordion.collapse();
  }

  private async waitUntilPopupAttached(prevPopupCount: number): Promise<void> {
    // Wait until popup attached to the DOM.
    await waitForCondition(async () => (await this._appPO.popups.count()) > prevPopupCount);

    // Get popup index.
    const index = await this._appPO.popups.count() - 1;
    const popupId = await this._appPO.popups.nth(index).getAttribute('data-popupid') as PopupId | null;
    if (!popupId) {
      throw Error('[PageObjectError] No popup found');
    }

    const popup = this._appPO.popup({popupId});

    // Wait for the popup to have a stable size.
    await waitUntilBoundingBoxStable(popup.locator);

    // Wait for the popup to have focus.
    await waitUntilStable(async () => (await this._appPO.focusOwner()) === await popup.getPopupId());
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
}
