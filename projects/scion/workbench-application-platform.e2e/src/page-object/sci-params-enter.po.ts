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

export class SciParamsEnterPanelPO {

  /**
   * Allows to enter parameters into '<sci-params-enter>' panel.
   */
  public async enterParams(params: Object, sciParamsEnterPanel: ElementFinder): Promise<void> {
    const addButton = sciParamsEnterPanel.$('button.e2e-add');
    const lastKeyInput = sciParamsEnterPanel.$$('input.e2e-key').last();
    const lastValueInput = sciParamsEnterPanel.$$('input.e2e-value').last();

    for (const key of Object.keys(params)) {
      await addButton.click();
      await lastKeyInput.sendKeys(key);
      await lastValueInput.sendKeys(`${params[key]}`);
    }
  }
}
