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

  constructor(public readonly locator: Locator) {
  }

  public async click(): Promise<void> {
    await this.locator.locator('button').click();
  }

  public getTooltip(): Promise<string | null> {
    return this.locator.getAttribute('title');
  }

  /**
   * Locates this activity item in the specified state.
   */
  public state(state: 'active' | 'focus-within-activity'): Locator {
    switch (state) {
      case 'active':
        return this.locator.locator(':scope[data-active]');
      case 'focus-within-activity':
        return this.locator.locator(':scope[data-focus-within-activity]');
    }
  }

  public badge(): Locator {
    return this.locator.locator('wb-icon').locator('div.e2e-badge');
  }
}
