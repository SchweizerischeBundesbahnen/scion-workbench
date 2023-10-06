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
import {coerceArray, rejectWhenAttached, waitUntilStable} from '../../helper/testing.util';
import {SciRouterOutletPO} from './sci-router-outlet.po';

/**
 * Page object to interact with {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO {

  public readonly locator: Locator;
  private readonly _view: ViewPO;
  public readonly viewTab: ViewTabPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, public viewId: string) {
    this._view = _appPO.view({viewId});
    this.viewTab = this._view.viewTab;
    this.outlet = new SciRouterOutletPO(this._appPO, {name: viewId});
    this.locator = this.outlet.frameLocator.locator('app-router-page');
  }

  public async isVisible(): Promise<boolean> {
    return await this._view.isVisible() && await this.locator.isVisible();
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

  public async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this.locator.locator('input.e2e-target').fill(target ?? '');
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this.locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async checkActivate(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate')).toggle(check);
  }

  public async checkClose(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-css-class').fill(coerceArray(cssClass).join(' '));
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   *
   * @param options - Controls how to navigate.
   *        @property probeInternal - Time to wait in ms until navigation is stable. Useful when performing many navigations simultaneously.
   */
  public async clickNavigate(options?: {probeInterval?: number}): Promise<void> {
    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilStable(() => this._appPO.getCurrentNavigationId(), options),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
