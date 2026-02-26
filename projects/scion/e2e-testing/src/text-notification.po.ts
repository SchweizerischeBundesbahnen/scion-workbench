/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {NotificationPO} from './notification.po';
import {WorkbenchNotificationPagePO} from './workbench/page-object/workbench-notification-page.po';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * Page object to interact with a workbench notification displaying text.
 */
export class TextNotificationPO implements WorkbenchNotificationPagePO {

  public readonly locator: Locator;
  public readonly text: Locator;

  constructor(public notification: NotificationPO) {
    this.locator = this.notification.locator.locator('div.e2e-slot');
    this.text = this.locator;
  }

  public async getTextBoundingBox(): Promise<DomRect> {
    return fromRect(await this.text.boundingBox());
  }
}
