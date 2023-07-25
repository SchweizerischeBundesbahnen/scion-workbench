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
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';
import {coerceArray, rejectWhenAttached, waitUntilStable} from '../../helper/testing.util';

/**
 * Page object to interact {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO {

  private readonly _locator: Locator;
  private readonly _viewPO: ViewPO;

  public readonly viewTabPO: ViewTabPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this._viewPO = _appPO.view({viewId});
    this.viewTabPO = this._viewPO.viewTab;
    this._locator = _appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-router-page');
  }

  public waitUntilAttached(): Promise<void> {
    return this._locator.waitFor({state: 'attached'});
  }

  public async isVisible(): Promise<boolean> {
    return await this._viewPO.isVisible() && await this._locator.isVisible();
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-params'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(params);
  }

  public async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this._locator.locator('input.e2e-target').fill(target ?? '');
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this._locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async checkActivate(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-activate')).toggle(check);
  }

  public async checkClose(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-close')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this._locator.locator('input.e2e-css-class').fill(coerceArray(cssClass).join(' '));
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   *
   * @param options - Controls how to navigate.
   *        @property probeInternal - Time to wait in ms until navigation is stable. Useful when performing many navigations simultaneously.
   */
  public async clickNavigate(options?: {probeInterval?: number}): Promise<void> {
    await this._locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilStable(() => this._appPO.getCurrentNavigationId(), options),
      rejectWhenAttached(this._locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
