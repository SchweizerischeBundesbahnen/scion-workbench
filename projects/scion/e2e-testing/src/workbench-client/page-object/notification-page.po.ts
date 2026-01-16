/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Params} from '@angular/router';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {NotificationPO} from '../../notification.po';
import {WorkbenchNotificationCapability} from './register-workbench-capability-page.po';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(public notification: NotificationPO) {
    this.outlet = new SciRouterOutletPO(notification.locator.page(), {name: notification.locateBy?.id, cssClass: notification.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-notification-page');
  }

  public async getNotificationCapability(): Promise<WorkbenchNotificationCapability> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-notification-capability'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-notification-capability').innerText()) as WorkbenchNotificationCapability;
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getNotificationParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-notification-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-notification-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordion.expand();
    try {
      return await accordion.itemLocator().locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async close(): Promise<void> {
    await this.locator.locator('button.e2e-close').click();
  }
}
