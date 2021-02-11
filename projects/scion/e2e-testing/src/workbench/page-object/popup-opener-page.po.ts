/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { assertPageToDisplay, enterText, selectOption } from '../../helper/testing.util';
import { AppPO, ViewPO, ViewTabPO } from '../../app.po';
import { SciAccordionPO, SciCheckboxPO } from '@scion/toolkit.internal/widgets.po';
import { ElementFinder } from 'protractor';
import { WebdriverExecutionContexts } from '../../helper/webdriver-execution-context';
import { coerceArray } from '@angular/cdk/coercion';
import { PopupOrigin, PopupSize } from '@scion/workbench';

/**
 * Page object to interact {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = this.viewPO.$('app-popup-opener-page');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.isPresent();
  }

  public async selectPopupComponent(component: 'popup-page' | 'popup-focus-page'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(component, this._pageFinder.$('select.e2e-popup-component'));
  }

  public async selectAnchor(anchor: 'element' | 'coordinate'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
    try {
      await selectOption(anchor, this._pageFinder.$('select.e2e-anchor'));
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterAnchorCoordinate(coordinate: PopupOrigin): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
    try {
      if (coordinate.x !== undefined) {
        await enterText(`${coordinate.x}`, this._pageFinder.$('input.e2e-anchor-x'));
      }
      if (coordinate.y !== undefined) {
        await enterText(`${coordinate.y}`, this._pageFinder.$('input.e2e-anchor-y'));
      }
      if (coordinate.width !== undefined) {
        await enterText(`${coordinate.width}`, this._pageFinder.$('input.e2e-anchor-width'));
      }
      if (coordinate.height !== undefined) {
        await enterText(`${coordinate.height}`, this._pageFinder.$('input.e2e-anchor-height'));
      }
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async selectAlign(align: 'east' | 'west' | 'north' | 'south'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(align, this._pageFinder.$('select.e2e-align'));
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(coerceArray(cssClass).join(' '), this._pageFinder.$('input.e2e-class'));
  }

  public async enterCloseStrategy(options: { closeOnFocusLost?: boolean, closeOnEscape?: boolean }): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-close-strategy'));
    await accordionPO.expand();
    try {
      if (options.closeOnFocusLost !== undefined) {
        await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-close-on-focus-lost')).toggle(options.closeOnFocusLost);
      }
      if (options.closeOnEscape !== undefined) {
        await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-close-on-escape')).toggle(options.closeOnEscape);
      }
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async expandSizePanel(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
  }

  public async collapseSizePanel(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.collapse();
  }

  public async enterPreferredOverlaySize(size: PopupSize): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
    try {
      size.width && await enterText(size.width, this._pageFinder.$('input.e2e-width'));
      size.height && await enterText(size.height, this._pageFinder.$('input.e2e-height'));
      size.minWidth && await enterText(size.minWidth, this._pageFinder.$('input.e2e-min-width'));
      size.maxWidth && await enterText(size.maxWidth, this._pageFinder.$('input.e2e-max-width'));
      size.minHeight && await enterText(size.minHeight, this._pageFinder.$('input.e2e-min-height'));
      size.maxHeight && await enterText(size.maxHeight, this._pageFinder.$('input.e2e-max-height'));
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterPopupInput(input: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-input'));
    await accordionPO.expand();
    try {
      await enterText(input, this._pageFinder.$('input.e2e-input'));
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterContextualViewId(viewId: string | '<null>'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(viewId, this._pageFinder.$('input.e2e-contextual-view-id'));
  }

  public async clickOpen(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-open').click();
  }

  public async getPopupCloseAction(): Promise<PopupCloseAction> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    if (await this._pageFinder.$('output.e2e-return-value').isPresent()) {
      return {
        type: 'closed-with-value',
        value: await this._pageFinder.$('output.e2e-return-value').getText(),
      };
    }
    if (await this._pageFinder.$('output.e2e-popup-error').isPresent()) {
      return {
        type: 'closed-with-error',
        value: await this._pageFinder.$('output.e2e-popup-error').getText(),
      };
    }
    return {
      type: 'closed',
    };
  }

  public async getAnchorElementClientRect(): Promise<ClientRect> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const buttonFinder = this._pageFinder.$('button.e2e-open');
    const {width, height} = await buttonFinder.getSize();
    const {x, y} = await buttonFinder.getLocation();
    return {
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      width,
      height,
    };
  }

  /**
   * Opens the page to test the popup in a new view tab.
   */
  public static async openInNewTab(): Promise<PopupOpenerPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openWorkbenchView('e2e-test-popup');
    const viewId = await appPO.findActiveView().getViewId();
    return new PopupOpenerPagePO(viewId);
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}
