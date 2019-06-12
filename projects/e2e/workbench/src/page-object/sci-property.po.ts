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

export class SciPropertyPanelPO {

  /**
   * Allows to read properties from '<sci-property>' panel.
   */
  public async readProperties(sciPropertyPanel: ElementFinder): Promise<{ [key: string]: string }> {
    const keysFinder = sciPropertyPanel.$$('.e2e-key');
    const valuesFinder = sciPropertyPanel.$$('.e2e-value');

    const propertyCount = await keysFinder.count();
    if (propertyCount === 0) {
      return null;
    }

    const properties: { [key: string]: string } = {};
    for (let i = 0; i < propertyCount; i++) {
      const key = await keysFinder.get(i).getText();
      const value = await valuesFinder.get(i).getText();
      properties[key] = value;
    }

    return properties;
  }
}
