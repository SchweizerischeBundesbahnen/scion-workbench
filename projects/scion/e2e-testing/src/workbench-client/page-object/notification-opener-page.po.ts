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
import {Qualifier} from '@scion/microfrontend-platform';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact {@link NotificationOpenerPageComponent}.
 */
export class NotificationOpenerPagePO {

  private readonly _locator: Locator;
  private _cssClasses: string[];

  constructor(private _appPO: AppPO, public viewId: string) {
    this._locator = _appPO.page.frameLocator(ElementSelectors.routerOutlet(viewId)).locator('app-notification-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await assertElementVisible(this._locator);
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Record<string, string>): Promise<void> {
    await assertElementVisible(this._locator);
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterTitle(title: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async enterContent(content: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-content').fill(content);
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

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const errorLocator = this._locator.locator('output.e2e-error');
    return Promise.race([
      this._appPO.findNotification({cssClass: this._cssClasses}).locator().waitFor({state: 'visible'}),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }

  public async pressEscape(): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.click();
    await this._locator.press('Escape');
  }
}
