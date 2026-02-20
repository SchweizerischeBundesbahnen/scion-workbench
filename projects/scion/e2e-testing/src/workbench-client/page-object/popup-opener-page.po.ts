/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {ViewPO} from '../../view.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO, WorkbenchViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {BottomLeftPoint, BottomRightPoint, CloseStrategy, PopupOrigin, TopLeftPoint, TopRightPoint, WorkbenchPopupOptions} from '@scion/workbench-client';
import {PartPO} from '../../part.po';
import {PopupPO} from '../../popup.po';
import {DialogPO} from '../../dialog.po';
import {MicrofrontendDialogPagePO, WorkbenchDialogPagePO} from '../../workbench/page-object/workbench-dialog-page.po';
import {MicrofrontendPopupPagePO, WorkbenchPopupPagePO} from '../../workbench/page-object/workbench-popup-page.po';
import {AppPO} from '../../app.po';
import {NotificationPO} from '../../notification.po';

/**
 * Page object to interact with {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO, WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly notification: NotificationPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly returnValue: Locator;
  public readonly error: Locator;
  public readonly openButton: Locator;

  private readonly _appPO: AppPO;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO | NotificationPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(locateBy.locator.page(), {name: locateBy.locateBy?.id, cssClass: locateBy.locateBy?.cssClass});
    this.locator = (options?.host ? locateBy.locator : this.outlet.frameLocator).locator('app-popup-opener-page');

    this.part = locateBy instanceof PartPO ? locateBy : undefined!;
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;
    this.notification = locateBy instanceof NotificationPO ? locateBy : undefined!;

    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-popup-error');
    this.openButton = this.locator.locator('button.e2e-open');

    this._appPO = new AppPO(this.locator.page());
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

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._appPO.popups.nth(popupCount)).then(() => this._appPO.waitUntilIdle()), // Wait until idle to have stable bounding box and focus owner
      rejectWhenAttached(this.error),
    ]);
  }

  public async enterPosition(position: PopupOrigin): Promise<void> {
    const topLeft = position as Partial<TopLeftPoint>;
    const topRight = position as Partial<TopRightPoint>;
    const bottomLeft = position as Partial<BottomLeftPoint>;
    const bottomRight = position as Partial<BottomRightPoint>;

    if (topLeft.top !== undefined && topLeft.left !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('top-left');
      await this.locator.locator('input.e2e-position-vertical').fill(`${topLeft.top}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${topLeft.left}`);
    }
    else if (topRight.top !== undefined && topRight.right !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('top-right');
      await this.locator.locator('input.e2e-position-vertical').fill(`${topRight.top}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${topRight.right}`);
    }
    else if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('bottom-left');
      await this.locator.locator('input.e2e-position-vertical').fill(`${bottomLeft.bottom}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${bottomLeft.left}`);
    }
    else if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
      await this.locator.locator('select.e2e-position').selectOption('bottom-right');
      await this.locator.locator('input.e2e-position-vertical').fill(`${bottomRight.bottom}`);
      await this.locator.locator('input.e2e-position-horizontal').fill(`${bottomRight.right}`);
    }
    else {
      throw Error('[PopupOriginError] Illegal popup origin; must be "Element", "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
    }

    await this.locator.locator('input.e2e-anchor-width').fill(`${position.width ?? ''}`);
    await this.locator.locator('input.e2e-anchor-height').fill(`${position.height ?? ''}`);
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
}

/**
 * Controls opening of a popup.
 */
export interface PopupOpenerPageOptions {
  /**
   * @see WorkbenchPopupOptions.anchor
   */
  anchor: 'element' | PopupOrigin;
}
