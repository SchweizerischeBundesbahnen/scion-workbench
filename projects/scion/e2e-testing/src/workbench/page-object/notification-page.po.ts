/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NotificationPO} from '../../notification.po';
import {coerceArray, DomRect, fromRect} from '../../helper/testing.util';
import {Locator} from '@playwright/test';
import {WorkbenchNotificationPagePO} from './workbench-notification-page.po';
import {Translatable} from '@scion/workbench';
import {ActivatedMicrofrontendPO} from './activated-microfrontend.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationPagePO implements WorkbenchNotificationPagePO {

  public readonly locator: Locator;
  public readonly activatedMicrofrontend: ActivatedMicrofrontendPO;
  public readonly input: Locator;

  constructor(public notification: NotificationPO) {
    this.locator = this.notification.locator.locator('app-notification-page');
    this.activatedMicrofrontend = new ActivatedMicrofrontendPO(this.locator.locator('app-activated-microfrontend'));
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

  public async enterNotificationSize(size: WorkbenchNotificationSize): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-notification-size'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await accordion.itemLocator().locator('input.e2e-max-height').fill(size.maxHeight ?? '');
    await accordion.collapse();
  }

  public async enterContentSize(size: {height?: string}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-content-size'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await accordion.collapse();
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public async close(): Promise<void> {
    await this.locator.locator('button.e2e-close').click();
  }
}

export interface WorkbenchNotificationSize {
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}
