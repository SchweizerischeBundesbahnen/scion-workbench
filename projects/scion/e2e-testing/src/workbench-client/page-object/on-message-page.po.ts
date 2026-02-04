/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {toTypedString} from '../../helper/typed-value.util';

export class OnMessagePagePO {

  public readonly locator: Locator;

  constructor(locator: Locator) {
    this.locator = locator.locator('app-on-message-page');
  }

  public async enterTopic(topic: string): Promise<void> {
    await this.locator.locator('input.e2e-topic').fill(topic);
  }

  public async enterValue(value: string | number | boolean | undefined): Promise<void> {
    await this.locator.locator('input.e2e-value').fill(toTypedString(value));
    await this.locator.locator('button.e2e-save-value').click();
  }

  public async installCallback(): Promise<void> {
    await this.locator.locator('button.e2e-install-on-message').click();
  }
}
