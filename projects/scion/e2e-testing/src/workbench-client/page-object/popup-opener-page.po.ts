/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertElementVisible, isPresent, waitUntilBoundingBoxStable} from '../../helper/testing.util';
import {AppPO, ViewTabPO} from '../../app.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {PopupOrigin} from '@scion/workbench';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact {@link PopupOpenerPageComponent}.
 */
export class PopupOpenerPagePO {

  private readonly _locator: Locator;

  public readonly viewTabPO: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.viewTabPO = _appPO.findViewTab({viewId: viewId});
    this._locator = _appPO.page.frameLocator(ElementSelectors.routerOutlet(viewId)).locator('app-popup-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await assertElementVisible(this._locator);
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    await assertElementVisible(this._locator);
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async selectAnchor(anchor: 'element' | 'coordinate'): Promise<void> {
    await assertElementVisible(this._locator);

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
    await assertElementVisible(this._locator);

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
    await assertElementVisible(this._locator);
    await this._locator.locator('select.e2e-align').selectOption(align);
  }

  public async enterCloseStrategy(options: {closeOnFocusLost?: boolean; closeOnEscape?: boolean}): Promise<void> {
    await assertElementVisible(this._locator);

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

  public async expandAnchorPanel(): Promise<void> {
    await assertElementVisible(this._locator);
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-anchor'));
    await accordionPO.expand();
  }

  public async collapseAnchorPanel(): Promise<void> {
    await assertElementVisible(this._locator);
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-anchor'));
    await accordionPO.collapse();
  }

  public async clickOpen(): Promise<void> {
    await assertElementVisible(this._locator);

    const expectedPopupIndex = await this._appPO.popupLocator().count();

    await this._locator.locator('button.e2e-open').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const errorLocator = this._locator.locator('output.e2e-popup-error');
    return Promise.race([
      this._appPO.popupLocator().nth(expectedPopupIndex).waitFor({state: 'visible'}),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }

  public async getPopupCloseAction(): Promise<PopupCloseAction> {
    await assertElementVisible(this._locator);

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
    await assertElementVisible(this._locator);

    const buttonLocator = this._locator.locator('button.e2e-open');
    return waitUntilBoundingBoxStable(buttonLocator);
  }
}

export interface PopupCloseAction {
  type: 'closed' | 'closed-with-value' | 'closed-with-error';
  value?: string;
}
