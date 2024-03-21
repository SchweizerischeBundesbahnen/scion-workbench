/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {Locator} from '@playwright/test';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';

/**
 * Page object to interact with {@link AddViewPageComponent}.
 */
export class AddViewPagePO {

  constructor(public locator: Locator) {
  }

  public async addView(viewId: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): Promise<void> {
    await this.locator.locator('input.e2e-view-id').fill(viewId);
    await this.locator.locator('input.e2e-part-id').fill(options.partId);
    await this.locator.locator('input.e2e-position').fill(`${options.position ?? ''}`);
    await this.locator.locator('input.e2e-css-class').fill(coerceArray(options.cssClass).join(' '));
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate-view')).toggle(options.activateView ?? false);
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate-part')).toggle(options.activatePart ?? false);

    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
