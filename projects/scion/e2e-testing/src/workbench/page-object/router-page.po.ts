/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {waitUntilStable} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator, Page} from '@playwright/test';
import {Params} from '@angular/router';

/**
 * Page object to interact {@link RouterPageComponent}.
 */
export class RouterPagePO {

  private readonly _page: Page;
  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this._page = appPO.page;
    this.viewPO = appPO.findView({viewId: viewId});
    this.viewTabPO = appPO.findViewTab({viewId: viewId});
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

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-activate-if-present')).toggle(check);
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close-if-present')).toggle(check);
  }

  public async selectTarget(target: 'self' | 'blank'): Promise<void> {
    await this._locator.locator('select.e2e-target').selectOption(target);
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this._locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async enterSelfViewId(selfViewId: string): Promise<void> {
    await this._locator.locator('input.e2e-self-view-id').fill(selfViewId);
  }

  public async clickNavigateViaRouter(): Promise<void> {
    await this._locator.locator('button.e2e-router-navigate').click();
    // Wait until navigation completed.
    await waitUntilStable(async () => this._page.url());
  }

  /**
   * Clicks on the router link, optionally pressing the specified modifier key.
   */
  public async clickNavigateViaRouterLink(modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>): Promise<void> {
    await this._locator.locator('a.e2e-router-link-navigate').click({modifiers});
    // Wait until navigation completed.
    await waitUntilStable(async () => this._page.url());
  }
}
