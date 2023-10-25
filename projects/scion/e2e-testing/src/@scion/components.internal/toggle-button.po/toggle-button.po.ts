/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object for {@link SciToggleButtonComponent}.
 */
export class SciToggleButtonPO {

  private _inputLocator: Locator;

  constructor(private _locator: Locator) {
    this._inputLocator = this._locator.locator('input[type="checkbox"]');
  }

  public async toggle(on: boolean): Promise<void> {
    if (await this._inputLocator.isChecked() !== on) {
      await this._locator.click();
    }
  }
}
