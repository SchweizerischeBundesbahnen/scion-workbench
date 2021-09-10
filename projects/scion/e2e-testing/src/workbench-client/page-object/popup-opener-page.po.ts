/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, selectOption} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {SciAccordionPO, SciCheckboxPO, SciParamsEnterPO} from '@scion/toolkit.internal/widgets.po';
import {$, browser, ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {Qualifier} from '@scion/microfrontend-platform';
import {PopupOrigin} from '@scion/workbench';
import {Dictionary} from '@scion/toolkit/util';

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
    this._pageFinder = $('app-popup-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Dictionary): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async selectAnchor(anchor: 'element' | 'coordinate'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(align, this._pageFinder.$('select.e2e-align'));
  }

  public async enterCloseStrategy(options: {closeOnFocusLost?: boolean; closeOnEscape?: boolean}): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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

  public async expandAnchorPanel(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
  }

  public async collapseAnchorPanel(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-anchor'));
    await accordionPO.collapse();
  }

  public async clickOpen(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const expectedPopupCount = await this._appPO.getPopupCount() + 1;

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await this._pageFinder.$('button.e2e-open').click();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const errorFinder = this._pageFinder.$('output.e2e-popup-error');
    await browser.wait(async () => {
      // Test if the popup has opened
      await WebdriverExecutionContexts.switchToDefault();
      const actualPopupCount = await this._appPO.getPopupCount();
      if (actualPopupCount === expectedPopupCount) {
        return true;
      }

      // Test if an error is present
      await WebdriverExecutionContexts.switchToIframe(this.viewId);
      if (await errorFinder.isPresent()) {
        return true;
      }

      return false;
    }, 5000);

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    if (await errorFinder.isPresent()) {
      return Promise.reject(await errorFinder.getText());
    }
  }

  public async getPopupCloseAction(): Promise<PopupCloseAction> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<PopupOpenerPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-test-popup', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new PopupOpenerPagePO(viewId);
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}
