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
import { enterText } from '../spec.util';
import { SwitchToIframeFn } from '../browser-outlet.po';

export class OutletRouterPagePO {

  public static readonly pageUrl = 'outlet-router'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-outlet-router');

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async enterOutletName(outlet: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(outlet, this._pageFinder.$('input.e2e-outlet'));
  }

  public async enterUrl(url: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(url, this._pageFinder.$('input.e2e-url'));
  }

  public async clickNavigate(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-navigate').click();
  }
}
