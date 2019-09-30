/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ElementFinder } from 'protractor';

/**
 * Page object for {@link SciCheckboxComponent}.
 */
export class SciCheckboxPO {

  private _checkboxFinder: ElementFinder;

  constructor(private _sciCheckboxFinder: ElementFinder) {
    this._checkboxFinder = this._sciCheckboxFinder.$('input[type="checkbox"]');
  }

  public async toggle(check: boolean): Promise<void> {
    const isChecked = await this._checkboxFinder.isSelected();

    if (check && !isChecked) {
      await this._checkboxFinder.click();
    }
    else if (!check && isChecked) {
      await this._checkboxFinder.click();
    }
  }
}
