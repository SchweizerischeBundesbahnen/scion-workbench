/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isActiveElement, isPresent} from '../../../helper/testing.util';
import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {PopupPO} from '../../../popup.po';
import {ViewPO} from '../../../view.po';

/**
 * Page object to interact with {@link FocusTestPageComponent}.
 */
export class FocusTestPagePO {

  public readonly locator: Locator;

  constructor(appPO: AppPO, locateBy: ViewPO | PopupPO) {
    this.locator = locateBy.locate('app-focus-test-page');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  public async isActiveElement(field: 'first-field' | 'middle-field' | 'last-field'): Promise<boolean> {
    return isActiveElement(this.locator.locator(`input.e2e-${field}`));
  }

  public async clickField(field: 'first-field' | 'middle-field' | 'last-field'): Promise<void> {
    await this.locator.locator(`input.e2e-${field}`).click();
  }
}
