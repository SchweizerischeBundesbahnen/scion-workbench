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
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {ViewPO} from '../../view.po';
import {ViewId} from '@scion/workbench';

/**
 * Page object to interact with {@link NotificationPageComponent}.
 */
export class NotificationOpenerPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly error: Locator;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-notification-opener-page');
    this.error = this.locator.locator('output.e2e-notification-open-error');
  }

  public async selectComponent(component: 'notification-page' | 'default'): Promise<void> {
    await this.locator.locator('select.e2e-component').selectOption(component);
  }

  public async enterContent(content: string): Promise<void> {
    await this.locator.locator('input.e2e-content').fill(content);
  }

  public async enterComponentInput(componentInput: string): Promise<void> {
    await this.locator.locator('input.e2e-component-input').fill(componentInput);
  }

  public async enterTitle(title: string): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await this.locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): Promise<void> {
    await this.locator.locator('input.e2e-duration').fill(`${duration}`);
  }

  public async enterGroup(group: string): Promise<void> {
    await this.locator.locator('input.e2e-group').fill(group);
  }

  public async checkUseGroupInputReduceFn(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-use-group-input-reducer')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async open(): Promise<void> {
    await this.locator.locator('button.e2e-show').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this.waitUntilNotificationAttached(),
      rejectWhenAttached(this.error),
    ]);
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
