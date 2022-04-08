/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {ElementFinders, RouterOutletSelector} from '../../helper/element-finders';

export class RouterOutletPO {

  /**
   * Tests if the given router outlet is present in the DOM.
   */
  public async isPresent(outletNameOrSelector: string | RouterOutletSelector): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return ElementFinders.routerOutlet(outletNameOrSelector).isPresent();
  }

  /**
   * Tests whether the given router outlet is visible to the user, that is,
   * the CSS property 'display' is not `none` and `visibility` not `hidden`.
   */
  public async isDisplayed(outletNameOrSelector: string | RouterOutletSelector): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return ElementFinders.routerOutlet(outletNameOrSelector).isDisplayed();
  }
}
