/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object for {@link SciCheckboxComponent}.
 */
export class SciCheckboxPO {

  private _locator: Locator;

  constructor(private _sciCheckboxLocator: Locator) {
    this._locator = this._sciCheckboxLocator.locator('input[type="checkbox"]');
  }

  public async toggle(check: boolean): Promise<void> {
    const isChecked = await this.isChecked();

    if (check !== isChecked) {
      await this._locator.click();
    }
  }

  public async isChecked(): Promise<boolean> {
    return this._locator.isChecked();
  }
}
