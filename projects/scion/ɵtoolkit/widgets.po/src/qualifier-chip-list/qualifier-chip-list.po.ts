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
import { Qualifier } from '@scion/microfrontend-platform';

/**
 * Page object for {@link SciQualifierChipListComponent}.
 */
export class SciQualifierChipListPO {

  constructor(private _sciQualifierChipListFinder: ElementFinder) {
  }

  public async getType(): Promise<string> {
    return this._sciQualifierChipListFinder.$('span.e2e-type').getText();
  }

  public async getQualifier(): Promise<Qualifier> {
    const entries: ElementFinder[] = await this._sciQualifierChipListFinder.$$('li.e2e-qualifier-entry');

    return entries.reduce(async (qualifier, entry) => {
      const key = await entry.$('span.e2e-key').getText();
      const value = await entry.$('span.e2e-value').getText();
      return {...qualifier, ...{[key]: value}};
    }, {});
  }
}
