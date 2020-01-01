/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ElementFinder } from 'protractor';
import { SciListPO, WaitUntil } from '@scion/ɵtoolkit/widgets.po';
import { ContextEntryListItemPO } from './context-entry-list-item.po';
import { SwitchToIframeFn } from '../browser-outlet.po';

export class ContextListPO {

  private _contextListPO: SciListPO;

  constructor(private _sciListFinder: ElementFinder, private _switchToIframeFn: SwitchToIframeFn) {
    this._contextListPO = new SciListPO(this._sciListFinder);
  }

  public async getContextListItemPOs(waitUntil?: WaitUntil): Promise<ContextEntryListItemPO[]> {
    await this._switchToIframeFn();
    const listItemPOs = await this._contextListPO.getListItems(waitUntil);
    return listItemPOs.map(listItemPO => new ContextEntryListItemPO(listItemPO, this._switchToIframeFn));
  }

  public async getContextMap(waitUntil?: WaitUntil): Promise<Map<string, any>> {
    await this._switchToIframeFn();
    const contextListItemPOs: ContextEntryListItemPO[] = await this.getContextListItemPOs(waitUntil);

    const map = new Map<string, any>();
    for (let i = 0; i < contextListItemPOs.length; i++) {
      const listItemPO = contextListItemPOs[i];
      const key = await listItemPO.getKey();
      const value = this.parseValue(await listItemPO.getValue());
      map.set(key, value);
    }
    return map;
  }

  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    }
    catch (error) {
      return value;
    }
  }
}
