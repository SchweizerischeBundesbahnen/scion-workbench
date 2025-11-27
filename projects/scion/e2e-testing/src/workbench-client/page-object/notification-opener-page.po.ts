/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../view.po';
import {Translatable, ViewId, WorkbenchNotificationOptions} from '@scion/workbench-client';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';

/**
 * Page object to interact with {@link NotificationOpenerPageComponent}.
 */
export class NotificationOpenerPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly view: ViewPO;
  public readonly error: Locator;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-notification-opener-page');
    this.error = this.locator.locator('output.e2e-notification-open-error');
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
    await this.locator.locator('button.e2e-show').click();

    if (options?.waitUntilAttached ?? true) {
      // Evaluate the response: resolve the promise on success, or reject it on error.
      return Promise.race([
        this.waitUntilNotificationAttached(),
        rejectWhenAttached(this.error),
      ]);
    }
  }

  private async waitUntilNotificationAttached(): Promise<void> {
    const cssClass = (await this.locator.locator('input.e2e-class').inputValue()).split(/\s+/).filter(Boolean);
    const notification = this._appPO.notification({cssClass});
    await notification.locator.waitFor({state: 'visible'});
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
   * Controls if to wait for the notification to display.
   */
  waitUntilAttached?: boolean;
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
