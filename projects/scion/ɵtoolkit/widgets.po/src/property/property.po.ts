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
import { Dictionary } from '@scion/toolkit/util';

/**
 * Page object for {@link SciPropertyComponent}.
 */
export class SciPropertyPO {

  constructor(private _sciPropertyFinder: ElementFinder) {
  }

  /**
   * Reads the properties as map.
   */
  public async readAsMap(): Promise<Map<string, string>> {
    const properties = await this.readAsDictionary();
    return Object.entries(properties).reduce((map: Map<string, string>, [key, value]: [string, any]) => map.set(key, value), new Map<string, string>());
  }

  /**
   * Reads the properties as dictionary.
   */
  public async readAsDictionary(): Promise<Dictionary> {
    const keysFinder = this._sciPropertyFinder.$$('.e2e-key');
    const valuesFinder = this._sciPropertyFinder.$$('.e2e-value');

    const propertyCount = await keysFinder.count();
    const properties: Dictionary = {};
    for (let i = 0; i < propertyCount; i++) {
      const key = await keysFinder.get(i).getText();
      const value = await valuesFinder.get(i).getText();
      properties[key] = value;
    }

    return properties;
  }
}
