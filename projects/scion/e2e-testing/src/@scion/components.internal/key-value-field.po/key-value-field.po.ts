/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {coerceMap} from '../../../helper/testing.util';
import {AppPO} from '../../../app.po';

/**
 * Page object for {@link SciKeyValueFieldComponent}.
 */
export class SciKeyValueFieldPO {

  constructor(private _locator: Locator) {
  }

  public async addEntries(entries: Record<string, unknown> | Map<string, unknown>): Promise<void> {
    const addButton = this._locator.locator('button.e2e-add');
    const keyInputs = this._locator.locator('input.e2e-key');
    const valueInputs = this._locator.locator('input.e2e-value');

    for (const [key, value] of coerceMap(entries).entries()) {
      const rowIndex = await keyInputs.count();
      await addButton.click();
      // Wait for the new row to appear in the DOM before filling it.
      await new AppPO(this._locator.page()).waitUntilAngularStable();
      await keyInputs.nth(rowIndex).fill(key);
      await valueInputs.nth(rowIndex).fill(`${value}`);
    }
  }

  public async clear(): Promise<void> {
    await this._locator.locator('button.e2e-clear').click();
    // Wait for all rows to be removed from the DOM before returning.
    await this._locator.locator('input.e2e-key').first().waitFor({state: 'detached'});
  }
}
