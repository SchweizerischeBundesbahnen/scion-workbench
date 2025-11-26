/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NotificationPO} from './notification.po';
import {coerceArray} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {WorkbenchNotificationPagePO} from './workbench/page-object/workbench-notification-page.po';
import {Translatable} from '@scion/workbench';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationPagePO implements WorkbenchNotificationPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;

  constructor(public notification: NotificationPO) {
    this.locator = this.notification.locator.locator('app-notification-page');
    this.input = this.locator.locator('output.e2e-input');
  }

  public async enterTitle(title: Translatable): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error' | ''): Promise<void> {
    await this.locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | '' | number): Promise<void> {
    await this.locator.locator('input.e2e-duration').fill(`${duration}`);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async close(): Promise<void> {
    await this.locator.locator('button.e2e-close').click();
  }
}
