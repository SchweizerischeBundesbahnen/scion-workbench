/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { clickElement, switchToIFrameContext } from '../util/testing.util';
import { $ } from 'protractor';

const E2E_TESTING_VIEW_CONTEXT = ['e2e-testing-app', 'e2e-view', 'e2e-view-b8bbbb11'];

export class TestcaseB8bbbb11ViewPO {

  private _linkFinder = $('a.e2e-testing-view-link');

  public async clickLink(pressKey?: string): Promise<void> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);

    if (pressKey) {
      await clickElement(this._linkFinder, pressKey);
    } else {
      await this._linkFinder.click();
    }
  }
}
