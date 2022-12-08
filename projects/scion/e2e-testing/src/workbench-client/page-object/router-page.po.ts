/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciParamsEnterPO} from '../../@scion/components.internal/params-enter.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';
import {coerceArray, waitUntilStable} from '../../helper/testing.util';

/**
 * Page object to interact {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO {

  private readonly _locator: Locator;
  private readonly _viewPO: ViewPO;

  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this._viewPO = appPO.view({viewId});
    this.viewTabPO = this._viewPO.viewTab;
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-router-page');
  }

  public async isVisible(): Promise<boolean> {
    return await this._viewPO.isVisible() && await this._locator.isVisible();
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async selectTarget(target: 'self' | 'blank'): Promise<void> {
    await this._locator.locator('select.e2e-target').selectOption(target);
  }

  public async enterSelfViewId(selfViewId: string): Promise<void> {
    await this._locator.locator('input.e2e-self-view-id').fill(selfViewId);
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this._locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-activate-if-present')).toggle(check);
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close-if-present')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-css-class').fill(coerceArray(cssClass).join(' '));
  }

  public async clickNavigate(): Promise<void> {
    await this._locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const errorLocator = this._locator.locator('output.e2e-navigate-error');
    await Promise.race([
      waitUntilStable(() => this._locator.page().url()),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }
}
