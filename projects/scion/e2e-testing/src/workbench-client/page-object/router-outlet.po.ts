/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {$, browser, protractor} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';

const EC = protractor.ExpectedConditions;

export class RouterOutletPO {

  /**
   * Resolves to the name of the <sci-router-outlet> that has given CSS class(es) set.
   */
  public async resolveRouterOutletName(...cssClass: string[]): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();

    const routerOutletFinder = $(`sci-router-outlet.${cssClass.join('.')}`);
    await browser.wait(EC.presenceOf(routerOutletFinder), 5000);
    return routerOutletFinder.getAttribute('name');
  }

  /**
   * Tests if the given router outlet is present in the DOM.
   */
  public async isPresent(outletName: string): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return $(`sci-router-outlet[name="${outletName}"]`).isPresent();
  }

  /**
   * Tests whether the given router outlet is visible to the user, that is,
   * the CSS property 'display' is not `none` and `visibility` not `hidden`.
   */
  public async isDisplayed(outletName: string): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return $(`sci-router-outlet[name="${outletName}"]`).isDisplayed();
  }
}
