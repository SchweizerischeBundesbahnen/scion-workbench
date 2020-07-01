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
import { clickElement } from '../util/testing.util';

export class TestcaseBb9700a6ViewPO {

  private _viewFinder = $('app-view-bb9700a6');
  private _linkFinder = this._viewFinder.$('a.e2e-view-link');

  public async clickLink(pressKey?: string): Promise<void> {
    if (pressKey) {
      await clickElement(this._linkFinder, pressKey);
    } else {
      await this._linkFinder.click();
    }
  }
}
