/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {PopupPO} from '../../../popup.po';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';

/**
 * Page object to interact with {@link FocusTestPageComponent}.
 */
export class FocusTestPagePO {

  public readonly locator: Locator;

  public firstField: Locator;
  public middleField: Locator;
  public lastField: Locator;

  constructor(locateBy: ViewPO | PopupPO | DialogPO) {
    this.locator = locateBy.locator.locator('app-focus-test-page');
    this.firstField = this.locator.locator('input.e2e-first-field');
    this.middleField = this.locator.locator('input.e2e-middle-field');
    this.lastField = this.locator.locator('input.e2e-last-field');
  }

  public clickField(field: 'first-field' | 'middle-field' | 'last-field', options?: {timeout?: number}): Promise<void> {
    switch (field) {
      case 'first-field': {
        return this.firstField.click({timeout: options?.timeout});
      }
      case 'middle-field': {
        return this.middleField.click({timeout: options?.timeout});
      }
      case 'last-field': {
        return this.lastField.click({timeout: options?.timeout});
      }
      default: {
        throw Error(`[IllegalArgumentError] Specified field not found: ${field}`);
      }
    }
  }
}
