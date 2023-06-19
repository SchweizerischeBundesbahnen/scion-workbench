/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilStable} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {SciParamsEnterPO} from '../../@scion/components.internal/params-enter.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {Params} from '@angular/router';

/**
 * Page object to interact {@link RouterPageComponent}.
 */
export class RouterPagePO {

  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this.viewPO = this._appPO.view({viewId});
    this.viewTabPO = this.viewPO.viewTab;
    this._locator = this.viewPO.locator('app-router-page');
  }

  public async enterPath(path: string): Promise<void> {
    await this._locator.locator('input.e2e-path').fill(path);
  }

  public async enterMatrixParams(params: Params): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-matrix-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterQueryParams(params: Params): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-query-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterNavigationalState(state: Record<string, string>): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-navigational-state'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(state);
  }

  public async checkActivate(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-activate')).toggle(check);
  }

  public async checkClose(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close')).toggle(check);
  }

  public async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this._locator.locator('input.e2e-target').fill(target ?? '');
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this._locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async enterBlankPartId(blankPartId: string): Promise<void> {
    await this._locator.locator('input.e2e-blank-part-id').fill(blankPartId);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-css-class').fill(coerceArray(cssClass).join(' '));
  }

  public async checkViewContext(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-view-context')).toggle(check);
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   *
   * @param options - Controls how to navigate.
   *        @property probeInternal - Time to wait in ms until navigation is stable. Useful when performing many navigations simultaneously.
   */
  public async clickNavigate(options?: {probeInterval?: number}): Promise<void> {
    await this._locator.locator('button.e2e-router-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilStable(() => this._appPO.getCurrentNavigationId(), options),
      rejectWhenAttached(this._locator.locator('output.e2e-navigate-error')),
    ]);
  }

  /**
   * Clicks on the router link, optionally pressing the specified modifier key.
   */
  public async clickNavigateViaRouterLink(modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>): Promise<void> {
    await this._locator.locator('a.e2e-router-link-navigate').click({modifiers});
    // Wait until navigation completed.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  public isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }
}
