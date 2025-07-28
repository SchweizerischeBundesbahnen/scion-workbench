/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';

/**
 * Page object to interact with {@link SelectionProviderPageComponent}.
 */
export class SelectionProviderPagePO {

  constructor(public locator: Locator) {
  }

  public async setSelection(selection: {[type: string]: unknown[]}): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-selection'));
    await keyValueField.clear();
    selection = Object.entries(selection).reduce((acc, [type, elements]) => {
      return {
        ...acc,
        [type]: elements.join(' '),
      };
    }, {});
    await keyValueField.addEntries(selection);

    await this.locator.locator('button.e2e-set-selection').click();
  }
}

