/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { switchToMainContext } from '../util/testing.util';

export class Testcase61097badMessageBoxPO {

  constructor(private _msgboxCssClass: string) {
  }

  public async getItems(): Promise<string[]> {
    await switchToMainContext();
    const msgboxFinder = $(`wb-message-box.${this._msgboxCssClass} app-list-messagebox`);
    const itemFinder = msgboxFinder.$$('.e2e-item');
    const itemCount = await itemFinder.count();

    const items: string[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(await itemFinder.get(i).getText());
    }
    return items;
  }
}
