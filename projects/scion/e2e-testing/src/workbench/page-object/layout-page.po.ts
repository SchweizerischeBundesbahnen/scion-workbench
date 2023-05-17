/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ReferencePart} from '@scion/workbench';
import {SciTabbarPO} from '../../@scion/components.internal/tabbar.po';

/**
 * Page object to interact {@link LayoutPageComponent}.
 */
export class LayoutPagePO {

  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  private readonly _tabbarPO: SciTabbarPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewPO = appPO.view({viewId});
    this.viewTabPO = this.viewPO.viewTab;
    this._locator = this.viewPO.locator('app-layout-page');
    this._tabbarPO = new SciTabbarPO(this._locator.locator('sci-tabbar'));
  }

  public async addPart(partId: string, relativeTo: ReferencePart, options?: {activate?: boolean}): Promise<void> {
    const locator = this._locator.locator('app-add-part-page');

    await this._tabbarPO.selectTab('e2e-add-part');
    await locator.locator('section.e2e-part').locator('input.e2e-part-id').fill(partId);
    await new SciCheckboxPO(locator.locator('section.e2e-part').locator('sci-checkbox.e2e-activate')).toggle(options?.activate ?? false);
    await locator.locator('section.e2e-reference-part').locator('input.e2e-part-id').fill(relativeTo.relativeTo ?? '');
    await locator.locator('section.e2e-reference-part').locator('input.e2e-align').fill(relativeTo.align);
    await locator.locator('section.e2e-reference-part').locator('input.e2e-ratio').fill(`${relativeTo.ratio}`);
    await locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this._locator.locator('output.e2e-navigate-error')),
    ]);
  }

  public async addView(viewId: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean}): Promise<void> {
    const locator = this._locator.locator('app-add-view-page');

    await this._tabbarPO.selectTab('e2e-add-view');
    await locator.locator('section.e2e-view').locator('input.e2e-view-id').fill(viewId);
    await locator.locator('section.e2e-view-options').locator('input.e2e-part-id').fill(options.partId);
    options.position && await locator.locator('section.e2e-view-options').locator('input.e2e-position').fill(`${options.position}`);
    await new SciCheckboxPO(locator.locator('section.e2e-view-options').locator('sci-checkbox.e2e-activate-view')).toggle(options.activateView ?? false);
    await new SciCheckboxPO(locator.locator('section.e2e-view-options').locator('sci-checkbox.e2e-activate-part')).toggle(options.activatePart ?? false);
    await locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this._locator.locator('output.e2e-navigate-error')),
    ]);
  }

  public async activateView(viewId: string, options?: {activatePart?: boolean}): Promise<void> {
    const locator = this._locator.locator('app-activate-view-page');

    await this._tabbarPO.selectTab('e2e-activate-view');
    await locator.locator('section.e2e-view').locator('input.e2e-view-id').fill(viewId);
    await new SciCheckboxPO(locator.locator('section.e2e-view-options').locator('sci-checkbox.e2e-activate-part')).toggle(options?.activatePart ?? false);
    await locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this._locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
