/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object for {@link SciTabbarComponent}.
 */
export class SciTabbarPO {

  constructor(private _sciTabbarLocator: Locator) {
  }

  /**
   * Selects the tab that has the given CSS class set.
   */
  public async selectTab(tabCssClass: string): Promise<void> {
    await this._sciTabbarLocator.locator(`.e2e-tab.${tabCssClass}`).click();
  }
}
