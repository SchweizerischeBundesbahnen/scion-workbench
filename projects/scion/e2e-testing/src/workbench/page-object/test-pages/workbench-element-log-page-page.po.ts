/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {PartPO} from '../../../part.po';

export class WorkbenchElementLogPagePagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;

  constructor(appPO: AppPO) {
    this.part = appPO.part({partId: 'part.log'});
    this.locator = this.part.locator.locator('app-active-workbench-element-log');
  }

  /**
   * Clears the log. Focus is not changed.
   */
  public async clearLog(): Promise<void> {
    // Click via JavaScript to not gain focus.
    const closeButton = this.part.bar.action({cssClass: 'e2e-clear'}).locator.locator('button');
    await closeButton.evaluate((button: HTMLElement) => button.click());
  }

  public async getLog(): Promise<string[]> {
    const log = await this.locator.locator('textarea.e2e-log').inputValue();
    return log.length ? log.split('\n') : [];
  }
}
