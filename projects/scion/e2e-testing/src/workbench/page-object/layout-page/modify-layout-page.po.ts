/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {rejectWhenAttached, waitForCondition} from '../../../helper/testing.util';
import {Locator} from '@playwright/test';
import {WorkbenchLayout} from '@scion/workbench';
import {LayoutPages} from './layout-pages.po';
import {AppPO} from '../../../app.po';
import {ɵWorkbenchLayout} from './layout.model';

/**
 * Page object to interact with {@link ModifyLayoutPageComponent}.
 */
export class ModifyLayoutPagePO {

  constructor(public locator: Locator) {
  }

  public async modify(fn: (layout: WorkbenchLayout) => WorkbenchLayout): Promise<void> {
    const {parts, views, partNavigations, viewNavigations} = fn(new ɵWorkbenchLayout()) as ɵWorkbenchLayout;

    // Enter the layout.
    await LayoutPages.enterParts(this.locator.locator('app-add-parts'), parts);
    await LayoutPages.enterViews(this.locator.locator('app-add-views'), views);
    await LayoutPages.enterPartNavigations(this.locator.locator('app-navigate-parts'), partNavigations);
    await LayoutPages.enterViewNavigations(this.locator.locator('app-navigate-views'), viewNavigations);

    // Apply the layout.
    const appPO = new AppPO(this.locator.page());
    const navigationId = await appPO.getCurrentNavigationId();
    await this.locator.locator('button.e2e-modify').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitForCondition(async () => (await appPO.getCurrentNavigationId()) !== navigationId),
      rejectWhenAttached(this.locator.locator('output.e2e-modify-error')),
    ]);
  }
}
