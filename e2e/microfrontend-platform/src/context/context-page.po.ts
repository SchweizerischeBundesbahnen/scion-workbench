/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $ } from 'protractor';
import { SwitchToIframeFn } from '../browser-outlet.po';
import { ContextListPO } from './context-list.po';

export class ContextPagePO {

  public static readonly pageUrl = 'context'; // path to the page; required by {@link TestingAppPO}
  private _pageFinder = $('app-context');

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
  }

  public getContext(): Promise<Map<string, any>> {
    const contextListPO = new ContextListPO(this._pageFinder.$('sci-list'), this._switchToIframeFn);
    return contextListPO.getContextMap();
  }
}
