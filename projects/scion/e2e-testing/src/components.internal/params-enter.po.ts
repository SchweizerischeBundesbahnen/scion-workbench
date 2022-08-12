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

/**
 * Page object for {@link SciParamsEnterComponent}.
 */
export class SciParamsEnterPO {

  constructor(private _sciParamsEnterLocator: Locator) {
  }

  public async enterParams(params: Record<string, any>): Promise<void> {
    const addButton = this._sciParamsEnterLocator.locator('button.e2e-add');
    const lastKeyInput = this._sciParamsEnterLocator.locator('input.e2e-key').last();
    const lastValueInput = this._sciParamsEnterLocator.locator('input.e2e-value').last();

    for (const key of Object.keys(params)) {
      await addButton.click();
      await lastKeyInput.fill(key);
      await lastValueInput.fill(`${params[key]}`);
    }
  }

  public async clear(): Promise<void> {
    await this._sciParamsEnterLocator.locator('button.e2e-clear').click();
  }
}
