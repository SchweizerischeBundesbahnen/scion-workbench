/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {Locator} from '@playwright/test';
import {isPresent} from './helper/testing.util';

/**
 * Page object to interact {@link TextNotificationComponent}.
 */
export class TextNotificationPO {

  private readonly _locator: Locator;

  constructor(appPO: AppPO, cssClass: string) {
    this._locator = appPO.findNotification({cssClass}).locator('wb-text-notification');
  }

  public async isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async getText(): Promise<string> {
    return this._locator.innerText();
  }

  /**
   * Waits for the notification to be closed.
   * Throws an error if not closed after `duration` milliseconds.
   */
  public async waitUntilClosed(duration: number): Promise<void> {
    await this._locator.waitFor({state: 'detached', timeout: duration});
  }
}
