/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertElementVisible, coerceArray} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link NotificationPageComponent}.
 */
export class NotificationOpenerPagePO {

  private readonly _locator: Locator;
  private _cssClasses: string[];

  constructor(private _appPO: AppPO, public viewId: string) {
    this._locator = this._appPO.findView({viewId: viewId}).locator('app-notification-opener-page');
  }

  public async selectComponent(component: 'inspect-notification' | 'default'): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('select.e2e-component').selectOption(component);
  }

  public async enterContent(content: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-content').fill(content);
  }

  public async enterComponentInput(componentInput: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-component-input').fill(componentInput);
  }

  public async enterTitle(title: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('select.e2e-severity').selectOption(severity);
  }

  public async selectDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-duration').fill(`${duration}`);
  }

  public async enterGroup(group: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-group').fill(group);
  }

  public async checkUseGroupInputReduceFn(check: boolean): Promise<void> {
    await assertElementVisible(this._locator);
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-use-group-input-reducer')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await assertElementVisible(this._locator);
    this._cssClasses = coerceArray(cssClass);
    await this._locator.locator('input.e2e-class').fill(this._cssClasses.join(' '));
  }

  public async clickShow(): Promise<void> {
    await assertElementVisible(this._locator);

    if (!this._cssClasses || !this._cssClasses.length) {
      throw Error('Missing required CSS class to wait for the notification to display.');
    }

    await this._locator.locator('button.e2e-show').click();
    await this._appPO.findNotification({cssClass: this._cssClasses}).locator().waitFor({state: 'visible'});
  }

  public async pressEscape(): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.click();
    await this._locator.press('Escape');
  }
}
