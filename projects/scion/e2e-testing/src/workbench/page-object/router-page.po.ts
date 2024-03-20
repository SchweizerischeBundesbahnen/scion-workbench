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
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {Params} from '@angular/router';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {ViewState} from '@scion/workbench';

/**
 * Page object to interact with {@link RouterPageComponent}.
 */
export class RouterPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: string; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-router-page');
  }

  public async enterPath(path: string): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(path);
  }

  public async enterMatrixParams(params: Params): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-matrix-params'));
    await keyValueField.clear();
    await keyValueField.addEntries(params);
  }

  public async enterQueryParams(params: Params): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-query-params'));
    await keyValueField.clear();
    await keyValueField.addEntries(params);
  }

  public async enterState(state: ViewState): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-state'));
    await keyValueField.clear();
    await keyValueField.addEntries(state);
  }

  public async checkActivate(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate')).toggle(check);
  }

  public async checkClose(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close')).toggle(check);
  }

  public async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this.locator.locator('input.e2e-target').fill(target ?? '');
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await this.locator.locator('input.e2e-insertion-index').fill(`${insertionIndex}`);
  }

  public async enterBlankPartId(blankPartId: string): Promise<void> {
    await this.locator.locator('input.e2e-blank-part-id').fill(blankPartId);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-css-class').fill(coerceArray(cssClass).join(' '));
  }

  public async checkViewContext(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-view-context')).toggle(check);
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigate(): Promise<void> {
    await this.locator.locator('button.e2e-router-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilStable(() => this._appPO.getCurrentNavigationId()),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }

  /**
   * Clicks on the router link, optionally pressing the specified modifier key.
   */
  public async clickNavigateViaRouterLink(modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>): Promise<void> {
    await this.locator.locator('a.e2e-router-link-navigate').click({modifiers});
    // Wait until navigation completed.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }
}
