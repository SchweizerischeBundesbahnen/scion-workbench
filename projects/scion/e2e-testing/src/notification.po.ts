/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, fromRect, getCssClasses} from './helper/testing.util';

/**
 * Handle for interacting with a workbench notification.
 */
export class NotificationPO {

  public title: Locator;

  constructor(public readonly locator: Locator) {
    this.title = this.locator.locator('header.e2e-title');
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public async getSeverity(): Promise<'info' | 'warn' | 'error' | null> {
    return await this.locator.getAttribute('data-severity') as 'info' | 'warn' | 'error' | null;
  }

  public async hover(): Promise<void> {
    await this.locator.hover();
  }

  public async close(): Promise<void> {
    await this.locator.locator('button.e2e-close').click();
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }
}
