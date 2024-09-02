/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {Locator} from '@playwright/test';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';
import {WorkbenchLayoutFn} from '@scion/workbench';
import {LayoutPages} from './layout-pages.po';
import {ɵWorkbenchLayout, ɵWorkbenchLayoutFactory} from './layout.model';

/**
 * Page object to interact with {@link CreatePerspectivePageComponent}.
 */
export class CreatePerspectivePagePO {

  constructor(public locator: Locator) {
  }

  public async createPerspective(id: string, definition: PerspectiveDefinition): Promise<void> {
    // Enter perspective data.
    await this.locator.locator('input.e2e-id').fill(id);
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-transient')).toggle(definition.transient === true);
    await this.enterData(definition.data);

    // Enter the layout.
    const {parts, views, viewNavigations} = await definition.layout(new ɵWorkbenchLayoutFactory()) as ɵWorkbenchLayout;
    await LayoutPages.enterParts(this.locator.locator('app-add-parts'), parts);
    await LayoutPages.enterViews(this.locator.locator('app-add-views'), views);
    await LayoutPages.enterViewNavigations(this.locator.locator('app-navigate-views'), viewNavigations);

    // Register the perspective.
    await this.locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-register-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-register-error')),
    ]);
  }

  private async enterData(data: {[key: string]: any} | undefined): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-data'));
    await keyValueField.clear();
    await keyValueField.addEntries(data ?? {});
  }
}

export interface PerspectiveDefinition {
  layout: WorkbenchLayoutFn;
  data?: {[key: string]: any};
  transient?: true;
}
