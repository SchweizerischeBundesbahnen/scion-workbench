/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { SwitchToIframeFn } from '../browser-outlet.po';
import { SciListItemPO, SciQualifierChipListPO } from '@scion/ɵtoolkit/widgets.po';
import { Qualifier } from '@scion/microfrontend-platform';

export class IntentListItemPO {

  private _qualifierChipListPO: SciQualifierChipListPO;

  constructor(private _listItemPO: SciListItemPO, private _switchToIframeFn: SwitchToIframeFn) {
    this._qualifierChipListPO = new SciQualifierChipListPO(this._listItemPO.contentFinder.$('sci-qualifier-chip-list'));
  }

  public async getType(): Promise<string> {
    await this._switchToIframeFn();
    return this._qualifierChipListPO.getType();
  }

  public async getQualifier(): Promise<Qualifier> {
    await this._switchToIframeFn();
    return this._qualifierChipListPO.getQualifier();
  }

  public async isImplicit(): Promise<boolean> {
    await this._switchToIframeFn();
    return this._listItemPO.contentFinder.$('span.e2e-implicit').isPresent();
  }

  public async clickUnregister(): Promise<void> {
    await this._switchToIframeFn();
    await this._listItemPO.clickAction('e2e-unregister');
  }
}
