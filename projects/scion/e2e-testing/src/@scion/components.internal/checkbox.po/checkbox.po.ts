/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object for {@link SciCheckboxComponent}.
 */
export class SciCheckboxPO {

  private _inputLocator: Locator;

  constructor(private _locator: Locator) {
    this._inputLocator = this._locator.locator('input[type="checkbox"]');
  }

  public async toggle(check: boolean): Promise<void> {
    // We cannot use `Locator.check` or `Locator.uncheck` because the checkbox is not visible.
    // Ensure the value of the checkbox to be `false` when it is unchecked (not undefined).
    const isChecked = await this.isChecked();
    if (!isChecked && !check) {
      await this._locator.click();
      await this._locator.click();
    }
    else if (check !== isChecked) {
      await this._locator.click();
    }
  }

  public async isChecked(): Promise<boolean> {
    return this._inputLocator.isChecked();
  }
}
