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
import {PartPO} from '../../../part.po';

export class ActiveWorkbenchElementLogPagePO {

  public readonly locator: Locator;

  constructor(public readonly part: PartPO) {
    this.locator = this.part.locator.locator('app-active-workbench-element-log-page');
  }

  /**
   * Clears the log. Focus is not changed.
   */
  public async clearLog(): Promise<void> {
    // Click via JavaScript to not gain focus.
    const closeButton = this.part.bar.action({cssClass: 'e2e-clear'}).locator.locator('button');
    await closeButton.evaluate((button: HTMLElement) => button.click());
  }

  public async getLog(): Promise<Array<string | null>> {
    const log = await this.locator.locator('textarea.e2e-log').inputValue();
    if (log.length) {
      return log.split('\n').map(value => value === '<null>' ? null : value);
    }
    return [];
  }
}
