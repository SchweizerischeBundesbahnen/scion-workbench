/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ElementFinder} from 'protractor';
import {Dictionaries, Dictionary} from '../../toolkit/dictionaries.util';

/**
 * Page object for {@link SciParamsEnterComponent}.
 */
export class SciParamsEnterPO {

  constructor(private _sciParamsEnterFinder: ElementFinder) {
  }

  public async enterParams(params: Dictionary | Map<string, any>): Promise<void> {
    if (params instanceof Map) {
      await this.enterParams(Dictionaries.coerce(params));
    }

    const addButton = this._sciParamsEnterFinder.$('button.e2e-add');
    const lastKeyInput = this._sciParamsEnterFinder.$$('input.e2e-key').last();
    const lastValueInput = this._sciParamsEnterFinder.$$('input.e2e-value').last();

    for (const key of Object.keys(params)) {
      await addButton.click();
      await lastKeyInput.sendKeys(key);
      await lastValueInput.sendKeys(`${params[key]}`);
    }
  }

  public async clear(): Promise<void> {
    await this._sciParamsEnterFinder.$('button.e2e-clear').click();
  }
}
