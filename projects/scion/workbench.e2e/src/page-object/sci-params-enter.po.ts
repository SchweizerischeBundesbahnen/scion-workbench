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
import { Params } from '@angular/router';

export class SciParamsEnterPanelPO {

  constructor(private _sciParamsEnterPanel: ElementFinder) {
  }

  /**
   * Clears all params.
   */
  public async clear(): Promise<void> {
    await this._sciParamsEnterPanel.$$('.e2e-remove').each(removeParamButton => removeParamButton.click());
  }

  /**
   * Allows to enter parameters into '<sci-params-enter>' panel.
   */
  public async enterParams(params: Params): Promise<void> {
    const addButton = this._sciParamsEnterPanel.$('button.e2e-add');
    const lastKeyInput = this._sciParamsEnterPanel.$$('input.e2e-key').last();
    const lastValueInput = this._sciParamsEnterPanel.$$('input.e2e-value').last();

    for (const key of Object.keys(params)) {
      await addButton.click();
      await lastKeyInput.sendKeys(key);
      await lastValueInput.sendKeys(`${params[key]}`);
    }
  }
}
