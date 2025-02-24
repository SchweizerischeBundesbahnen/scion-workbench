/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Handle for interacting with an activity item in the activity bar.
 */
export class ActivityItemPO {

  public readonly buttonLocator: Locator;

  constructor(public readonly locator: Locator) {
    this.buttonLocator = locator.locator('button.activity-item');
  }

  public async click(): Promise<void> {
    await this.buttonLocator.click();
  }
}
