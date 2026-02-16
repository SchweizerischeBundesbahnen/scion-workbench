/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {WorkbenchNotificationPagePO} from '../../workbench/page-object/workbench-notification-page.po';
import {NotificationPO} from '../../notification.po';
import {DomRect, fromRect} from '../../helper/testing.util';

/**
 * Page object to interact with the built-in workbench notification capability to display text.
 *
 * @see NotificationTextMessageComponent
 */
export class TextNotificationPO implements WorkbenchNotificationPagePO {

  public readonly locator: Locator;
  public readonly text: Locator;

  constructor(public notification: NotificationPO) {
    this.locator = this.notification.locator.locator('wb-notification-text-message');
    this.text = this.locator;
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
