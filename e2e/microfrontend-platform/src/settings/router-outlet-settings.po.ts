/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $, ElementFinder, Key } from 'protractor';
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { sendKeys } from '../spec.util';

/**
 * Page object for {@link RouterOutletSettingsComponent}.
 */
export class RouterOutletSettingsPO {

  private readonly _contextOverlayFinder = $('.e2e-router-outlet-settings-overlay app-router-outlet-settings');

  constructor(private _pageFinder: ElementFinder, private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async open(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-settings').click();
  }

  public async close(): Promise<void> {
    await this._switchToIframeFn();
    await sendKeys(Key.ESCAPE);
  }

  public async clickPreferredSizeReset(): Promise<void> {
    await this._switchToIframeFn();
    await this._contextOverlayFinder.$('li.e2e-preferred-size').$('button.e2e-reset').click();
  }
}
