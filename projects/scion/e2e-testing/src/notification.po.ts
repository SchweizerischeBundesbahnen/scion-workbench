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
import {coerceArray, DomRect, fromRect, getCssClasses, hasCssClass, selectBy, waitUntilBoundingBoxStable, waitUntilStable} from './helper/testing.util';
import {RequireOne} from './helper/utility-types';
import {NotificationId} from '../../workbench/src/lib/workbench.identifiers';

/**
 * Handle for interacting with a workbench notification.
 */
export class NotificationPO {

  public readonly locator: Locator;
  public readonly locateBy?: {id?: NotificationId; cssClass?: string[]};
  public readonly title: Locator;
  public readonly viewport: Locator;
  public readonly slot: Locator;

  constructor(page: Page, locateBy: RequireOne<{notificationId: NotificationId; cssClass: string | string[]}>, options?: {nth?: number}) {
    this.locateBy = {id: locateBy.notificationId, cssClass: coerceArray(locateBy.cssClass)};
    this.locator = page.locator(selectBy('wb-notification', {attributes: {'data-notificationid': locateBy.notificationId}, cssClass: locateBy.cssClass})).nth(options?.nth ?? 0);
    this.title = this.locator.locator('header.e2e-title');
    this.viewport = this.locator.locator('sci-viewport.e2e-notification-slot');
    this.slot = this.locator.locator('div.e2e-notification-slot-bounds');
  }

  public async getNotificationId(): Promise<NotificationId> {
    return (await waitUntilStable(() => this.locator.getAttribute('data-notificationid'))) as NotificationId;
  }

  /**
   * Gets the bounding box of the notification or a specific area in the notification. Defaults to the bounding box of the notification.
   *
   * Options:
   * - `notification`: notification outer bounds, including border.
   * - 'notification-inset': notification inner bounds, without border.
   * - `slot`: bounds for slotted content; may differ from the actual content size if content overflows or does not fill the slot.
   */
  public async getBoundingBox(selector: 'notification' | 'notification-inset' | 'slot' = 'notification'): Promise<DomRect> {
    switch (selector) {
      case 'notification': {
        return waitUntilBoundingBoxStable(this.locator);
      }
      case 'notification-inset': {
        const {x, y, width, height} = await waitUntilBoundingBoxStable(this.locator);
        const {borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth} = await this.locator.evaluate((notification: HTMLElement) => getComputedStyle(notification));
        return fromRect({
          x: x + parseInt(borderLeftWidth),
          y: y + parseInt(borderTopWidth),
          width: width - parseInt(borderLeftWidth) - parseInt(borderRightWidth),
          height: height - parseInt(borderTopWidth) - parseInt(borderBottomWidth),
        });
      }
      case 'slot': {
        // Do not read bounds from 'div.e2e-notification-slot-bounds' to test actual slot bounds.
        const {paddingTop, paddingRight, paddingBottom, paddingLeft} = await this.viewport.locator('div.viewport-client[part="content"]').evaluate((slot: HTMLElement) => getComputedStyle(slot));
        const viewportBounds = await waitUntilBoundingBoxStable(this.viewport);
        return fromRect({
          x: viewportBounds.x + parseFloat(paddingLeft),
          y: viewportBounds.y + parseFloat(paddingTop),
          width: viewportBounds.width - parseFloat(paddingLeft) - parseFloat(paddingRight),
          height: viewportBounds.height - parseFloat(paddingTop) - parseFloat(paddingBottom),
        });
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
    await this.locator.waitFor({state: 'visible'});
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
