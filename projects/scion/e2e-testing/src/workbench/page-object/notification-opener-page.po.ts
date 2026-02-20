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
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {ViewPO} from '../../view.po';
import {Translatable, WorkbenchNotificationOptions} from '@scion/workbench';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {PartPO} from '../../part.po';
import {PopupPO} from '../../popup.po';
import {DialogPO} from '../../dialog.po';
import {WorkbenchDialogPagePO} from './workbench-dialog-page.po';
import {WorkbenchPopupPagePO} from './workbench-popup-page.po';
import {AppPO} from '../../app.po';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationOpenerPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly error: Locator;

  private readonly _appPO: AppPO;

  constructor(private _locateBy: ViewPO | PartPO | PopupPO | DialogPO) {
    this.locator = this._locateBy.locator.locator('app-notification-opener-page');
    this.error = this.locator.locator('output.e2e-notification-open-error');
    this._appPO = new AppPO(this.locator.page());
  }

  public async show(message: Translatable | null, options?: NotificationOpenerPageOptions): Promise<void>;
  public async show(component: 'component:notification-page' | 'component:focus-test-page' | 'component:dialog-opener-page' | 'component:legacy-notification-page', options?: NotificationOpenerPageOptions): Promise<void>;
  public async show(content: Translatable | null | 'component:notification-page', options?: NotificationOpenerPageOptions): Promise<void> {
    if (options?.injector) {
      throw Error('[PageObjectError] PageObject does not support the option `injector`.');
    }
    if (options?.providers) {
      throw Error('[PageObjectError] PageObject does not support the option `providers`.');
    }

    // Select API.
    const legacyAPI = options?.legacyAPI ?? false;
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-legacy-api')).toggle(legacyAPI);

    // Enter text or component.
    const componentMatch = content && /^component:(?<component>.+)$/.exec(content);
    if (componentMatch) {
      await this.locator.locator('select.e2e-component').selectOption(componentMatch.groups!['component']!);
    }
    else {
      await this.locator.locator('input.e2e-text').fill(content ?? '<null>');
    }

    // Enter inputs
    if (legacyAPI && options?.inputLegacy) {
      await this.locator.locator('input.e2e-input').fill(options.inputLegacy);
    }
    else if (!legacyAPI && options?.inputs) {
      const inputsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-inputs'));
      await inputsField.clear();
      await inputsField.addEntries(options.inputs);
    }

    // Enter title.
    await this.locator.locator('input.e2e-title').fill(options?.title ?? '');

    // Enter severity.
    await this.locator.locator('select.e2e-severity').selectOption(options?.severity ?? '');

    // Enter duration.
    await this.locator.locator('input.e2e-duration').fill(`${options?.duration ?? ''}`);

    // Enter group.
    await this.locator.locator('input.e2e-group').fill(options?.group ?? '');

    // Enter group input reducer.
    await this.locator.locator('select.e2e-group-input-reducer').selectOption(options?.groupInputReduceFn || '');

    // Enter count.
    await this.locator.locator('input.e2e-count').fill(`${options?.count ?? 1}`);

    // Enter CSS class.
    await this.locator.locator('input.e2e-class').fill(coerceArray(options?.cssClass).join(' '));

    // Open notification.
    const notificationCount = await this._appPO.notifications.count();
    await this.locator.locator('button.e2e-show').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      // Opening a popup in a group may not open a new popup. Therefore, wait for the browser to become idle.
      options?.group ? this._appPO.waitUntilIdle() : waitUntilAttached(this._appPO.notifications.nth(notificationCount)),
      rejectWhenAttached(this.error),
    ]);
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get popup(): PopupPO {
    if (this._locateBy instanceof PopupPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a popup.');
    }
  }

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
    }
  }
}

/**
 * Controls opening of a notification.
 */
export type NotificationOpenerPageOptions = Omit<WorkbenchNotificationOptions, 'groupInputReduceFn'> & {
  /**
   * Controls if to reduce inputs of notifications belonging to the same group.
   */
  groupInputReduceFn?: 'concat-input-reducer' | 'concat-input-async-reducer' | 'concat-input-legacy-reducer';
  /**
   * Controls how many notifications to open. Defaults to 1.
   */
  count?: number;
  /**
   * Controls if to use the legacy Workbench Notification API.
   *
   * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
   */
  legacyAPI?: true;
  /**
   * Input data if using the legacy Workbench Notification API.
   *
   * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
   */
  inputLegacy?: string;
};
