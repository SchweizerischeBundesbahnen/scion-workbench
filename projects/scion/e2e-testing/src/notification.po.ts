/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator, Page} from '@playwright/test';
import {coerceArray, DomRect, fromRect, getCssClasses, selectBy} from './helper/testing.util';
import {RequireOne} from './helper/utility-types';
import {NotificationId} from '../../workbench/src/lib/workbench.identifiers';

/**
 * Handle for interacting with a workbench notification.
 */
export class NotificationPO {

  public readonly locator: Locator;
  public readonly locateBy?: {id?: NotificationId; cssClass?: string[]};
  public readonly title: Locator;

  constructor(page: Page, locateBy: RequireOne<{notificationId: NotificationId; cssClass: string | string[]}>, options?: {nth?: number}) {
    this.locateBy = {id: locateBy.notificationId, cssClass: coerceArray(locateBy.cssClass)};
    this.locator = page.locator(selectBy('wb-notification', {attributes: {'data-notificationid': locateBy.notificationId}, cssClass: locateBy.cssClass})).nth(options?.nth ?? 0);
    this.title = this.locator.locator('header.e2e-title');
  }

  public async getNotificationId() {
    return (await this.locator.getAttribute('data-notificationid')) as NotificationId;
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
