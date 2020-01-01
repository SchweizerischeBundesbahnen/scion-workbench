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
import { SciListItemPO } from '@scion/ɵtoolkit/widgets.po';
import { ElementFinder } from 'protractor';

export class ContextEntryListItemPO {

  private _contentFinder: ElementFinder;

  constructor(private _listItemPO: SciListItemPO, private _switchToIframeFn: SwitchToIframeFn) {
    this._contentFinder = this._listItemPO.contentFinder.$('app-context-entry');
  }

  public async getKey(): Promise<string> {
    await this._switchToIframeFn();
    return this._contentFinder.$('span.e2e-key').getText();
  }

  public async getValue(): Promise<string> {
    await this._switchToIframeFn();
    return this._contentFinder.$('span.e2e-value').getText();
  }

  public async clickRemove(): Promise<void> {
    await this._switchToIframeFn();
    await this._listItemPO.clickAction('e2e-remove');
  }
}
