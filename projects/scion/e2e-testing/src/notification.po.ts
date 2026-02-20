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
import {coerceArray, DomRect, fromRect, getCssClasses, hasCssClass, selectBy} from './helper/testing.util';
import {RequireOne} from './helper/utility-types';
import {NotificationId} from '../../workbench/src/lib/workbench.identifiers';

/**
 * Handle for interacting with a workbench notification.
 */
export class NotificationPO {

  public readonly locator: Locator;
  public readonly locateBy?: {id?: NotificationId; cssClass?: string[]};
  public readonly title: Locator;
  public readonly slot: Locator;

  constructor(page: Page, locateBy: RequireOne<{notificationId: NotificationId; cssClass: string | string[]}>, options?: {nth?: number}) {
    this.locateBy = {id: locateBy.notificationId, cssClass: coerceArray(locateBy.cssClass)};
    this.locator = page.locator(selectBy('wb-notification', {attributes: {'data-notificationid': locateBy.notificationId}, cssClass: locateBy.cssClass})).nth(options?.nth ?? 0);
    this.title = this.locator.locator('header.e2e-title');
    this.slot = this.locator.locator('div.e2e-notification-slot-bounds');
  }

  public async getNotificationId(): Promise<NotificationId> {
    return (await this.locator.getAttribute('data-notificationid')) as NotificationId;
  }

  /**
   * Gets the bounding box of this notification (with or without border), or its slot (exclusive title). Defaults to the bounding box of the notification.
   */
  public async getBoundingBox(selector: 'notification' | 'notification-inset' | 'slot' = 'notification'): Promise<DomRect> {
    switch (selector) {
      case 'notification': {
        return fromRect(await this.locator.boundingBox());
      }
      case 'notification-inset': {
        const {x, y, width, height} = fromRect(await this.locator.boundingBox());
        const borderWidth = await this.locator.evaluate((element: HTMLElement) => parseInt(getComputedStyle(element).borderWidth, 10));
        return fromRect({
          x: x + borderWidth,
          y: y + borderWidth,
          width: width - 2 * borderWidth,
          height: height - 2 * borderWidth,
        });
      }
      case 'slot': {
        return fromRect(await this.locator.locator('div.e2e-notification-slot-bounds').boundingBox());
      }
    }
  }

  public async hasVerticalOverflow(): Promise<boolean> {
    const verticalScrollbar = this.locator.locator('sci-viewport.e2e-notification-slot > sci-scrollbar.vertical');
    return !!(await verticalScrollbar.count()) && await hasCssClass(verticalScrollbar, 'overflow');
  }

  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.locator.evaluate((notificationElement: HTMLElement) => getComputedStyle(notificationElement));
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
