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
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {coerceArray, rejectWhenAttached, waitUntilStable} from '../../helper/testing.util';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewId} from '@scion/workbench-client';

/**
 * Page object to interact with {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-router-page');
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
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigate(): Promise<void> {
    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilStable(() => this._appPO.getCurrentNavigationId()),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
