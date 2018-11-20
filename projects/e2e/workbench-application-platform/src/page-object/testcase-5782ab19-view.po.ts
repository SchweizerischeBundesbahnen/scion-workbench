/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { browser, protractor } from 'protractor';
import { switchToIFrameContext } from '../util/testing.util';

const E2E_TESTING_VIEW_CONTEXT: string[] = ['e2e-testing-app', 'e2e-view', 'e2e-view-5782ab19'];

export class Testcase5782ab19ViewPO {

  /**
   * Returns if given element is the active element.
   */
  public async isActiveElement(fieldId: string): Promise<boolean> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    const activeElementId = await browser.driver.switchTo().activeElement().getAttribute('id');
    return activeElementId === fieldId;
  }

  public async pressTab(): Promise<void> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await browser.actions().sendKeys(protractor.Key.TAB).perform();
  }

  public async pressShiftTab(): Promise<void> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await browser.actions().sendKeys(protractor.Key.SHIFT, protractor.Key.TAB, protractor.Key.SHIFT).perform();
  }
}
