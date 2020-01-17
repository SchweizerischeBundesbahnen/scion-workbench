/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $, ElementFinder } from 'protractor';
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { enterText, findAsync } from '../spec.util';
import { ContextListPO } from './context-list.po';

/**
 * Page object for {@link RouterOutletContextComponent}.
 */
export class RouterOutletContextPO {

  private readonly _contextOverlayFinder = $('.e2e-router-outlet-context-overlay app-router-outlet-context');

  constructor(private _pageFinder: ElementFinder, private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async open(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-context-define').click();
  }

  public async close(): Promise<void> {
    await this._switchToIframeFn();
    await this._contextOverlayFinder.$('header.e2e-header button.e2e-close').click();
  }

  public async addContextValue(key: string, value: string): Promise<void> {
    await this._switchToIframeFn();
    const addEntrySectionFinder = this._contextOverlayFinder.$('section.e2e-new-context-entry');
    await enterText(key, addEntrySectionFinder.$('input.e2e-name'));
    await enterText(value, addEntrySectionFinder.$('input.e2e-value'));
    await addEntrySectionFinder.$('button.e2e-add').click();
  }

  public async removeContextValue(key: string): Promise<void> {
    await this._switchToIframeFn();
    const contextListPO = new ContextListPO(this._contextOverlayFinder.$('sci-list.e2e-context'), this._switchToIframeFn);
    const contextListItemPOs = await contextListPO.getContextListItemPOs();
    const contextListItemPO = await findAsync(contextListItemPOs, async listItemPO => (await listItemPO.getKey()) === key);
    await contextListItemPO.clickRemove();
  }
}
