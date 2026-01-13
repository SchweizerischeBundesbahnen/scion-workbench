/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../view.po';
import {Translatable, WorkbenchNotificationOptions} from '@scion/workbench-client';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {AppPO} from '../../app.po';

/**
 * Page object to interact with {@link NotificationOpenerPageComponent}.
 */
export class NotificationOpenerPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly error: Locator;

  private readonly _appPO: AppPO;

  constructor(public view: ViewPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(view.locator.page(), {name: view.locateBy?.id, cssClass: view.locateBy?.cssClass});
    this.locator = (options?.host ? view.locator : this.outlet.frameLocator).locator('app-notification-opener-page');
    this.error = this.locator.locator('output.e2e-notification-open-error');

    this._appPO = new AppPO(this.locator.page());
  }

  public async show(message: Translatable, options?: NotificationOpenerPageOptions & WorkbenchNotificationOptions): Promise<void>;
  public async show(qualifier: Qualifier, options?: NotificationOpenerPageOptions & WorkbenchNotificationOptions): Promise<void>;
  public async show(content: Translatable | Qualifier, options?: NotificationOpenerPageOptions & WorkbenchNotificationOptions): Promise<void> {
    // Select API.
    const legacyAPI = options?.legacyAPI;
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-legacy-api')).toggle(legacyAPI?.enabled ?? false);
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-legacy-api-text-as-confg')).toggle(legacyAPI?.textAsConfig ?? true);

    // Clear qualifier.
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();

    // Enter text or qualifier.
    if (typeof content === 'string') {
      await this.locator.locator('input.e2e-text').fill(content);
    }
    else {
      await qualifierField.addEntries(content);
    }

    // Enter params.
    if (options?.params) {
      const paramsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
      await paramsField.clear();
      await paramsField.addEntries(options.params ?? {});
    }

    // Enter title.
    await this.locator.locator('input.e2e-title').fill(options?.title ?? '');

    // Enter severity.
    await this.locator.locator('select.e2e-severity').selectOption(options?.severity ?? '');

    // Enter duration.
    await this.locator.locator('input.e2e-duration').fill(`${options?.duration ?? ''}`);

    // Enter group.
    await this.locator.locator('input.e2e-group').fill(options?.group ?? '');

    // Enter CSS class.
    await this.locator.locator('input.e2e-class').fill(coerceArray(options?.cssClass).join(' '));

    // Open notification.
    const notificationCount = await this._appPO.notifications.count();
    await this.locator.locator('button.e2e-show').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    return Promise.race([
      options?.group ? this._appPO.waitUntilIdle() : waitUntilAttached(this._appPO.notifications.nth(notificationCount)),
      rejectWhenAttached(this.error),
    ]);
  }

  public async pressEscape(): Promise<void> {
    await this.locator.click();
    await this.locator.press('Escape');
  }
}

/**
 * Controls opening of a notification.
 */
export interface NotificationOpenerPageOptions {
  /**
   * Controls if to use the legacy Workbench Notification API.
   *
   * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
   */
  legacyAPI?: {
    enabled: true;
    textAsConfig: boolean;
  };
}
