/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';

export class WelcomePagePO {

  private _welcomePageFinder = $('app-welcome-page');

  constructor() {
  }

  public async clickTile(tileCssClass: string): Promise<void> {
    await this._welcomePageFinder.$(`.${tileCssClass}`).click();
  }

  public async isPresent(): Promise<boolean> {
    return this._welcomePageFinder.isPresent();
  }
}
