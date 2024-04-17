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
import {ViewId} from '@scion/workbench';

/**
 * Page object to interact with {@link RegisterPartActionPageComponent}.
 */
export class RegisterPartActionPagePO {

  constructor(public locator: Locator) {
  }

  public async registerPartAction(content: string, options?: {align?: 'start' | 'end'; viewId?: ViewId | ViewId[]; partId?: string | string[]; grid?: 'workbench' | 'mainArea'; cssClass?: string | string[]}): Promise<void> {
    await this.locator.locator('input.e2e-content').fill(content);
    await this.locator.locator('select.e2e-align').selectOption(options?.align ?? '');
    await this.locator.locator('input.e2e-class').fill(coerceArray(options?.cssClass).join(' '));
    await this.locator.locator('input.e2e-view-id').fill(coerceArray(options?.viewId).join(' '));
    await this.locator.locator('input.e2e-part-id').fill(coerceArray(options?.partId).join(' '));
    await this.locator.locator('input.e2e-grid').fill(options?.grid ?? '');
    await this.locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-register-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-register-error')),
    ]);
  }
}
