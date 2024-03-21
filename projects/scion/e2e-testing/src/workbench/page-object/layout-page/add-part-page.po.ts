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
import {ReferencePart} from '@scion/workbench';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';

/**
 * Page object to interact with {@link AddPartPageComponent}.
 */
export class AddPartPagePO {

  constructor(public locator: Locator) {
  }

  public async addPart(partId: string, relativeTo: ReferencePart, options?: {activate?: boolean}): Promise<void> {
    await this.locator.locator('input.e2e-part-id').fill(partId);
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate')).toggle(options?.activate ?? false);
    await this.locator.locator('input.e2e-relative-to').fill(relativeTo.relativeTo ?? '');
    await this.locator.locator('select.e2e-align').selectOption(relativeTo.align);
    await this.locator.locator('input.e2e-ratio').fill(relativeTo.ratio ? `${relativeTo.ratio}` : '');
    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
