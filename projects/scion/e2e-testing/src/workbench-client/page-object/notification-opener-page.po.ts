/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { assertPageToDisplay, enterText, selectOption, sendKeys } from '../../helper/testing.util';
import { AppPO, ViewPO, ViewTabPO } from '../../app.po';
import { SciParamsEnterPO } from '@scion/toolkit.internal/widgets.po';
import { $, browser, ElementFinder, Key } from 'protractor';
import { WebdriverExecutionContexts } from '../../helper/webdriver-execution-context';
import { Qualifier } from '@scion/microfrontend-platform';
import { Dictionary } from '@scion/toolkit/util';
import { coerceArray } from '@angular/cdk/coercion';

/**
 * Page object to interact {@link NotificationOpenerPageComponent}.
 */
export class NotificationOpenerPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;
  private _cssClasses: string[];

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-notification-opener-page');
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async enterParams(params: Dictionary): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterTitle(title: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async enterContent(content: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(content, this._pageFinder.$('input.e2e-content'));
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(severity, this._pageFinder.$('select.e2e-severity'));
  }

  public async selectDuration(severity: 'short' | 'medium' | 'long' | 'infinite'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(severity, this._pageFinder.$('select.e2e-duration'));
  }

  public async enterGroup(group: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(group, this._pageFinder.$('input.e2e-group'));
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    this._cssClasses = coerceArray(cssClass);
    await enterText(this._cssClasses.join(' '), this._pageFinder.$('input.e2e-class'));
  }

  public async clickShow(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    if (!this._cssClasses || !this._cssClasses.length) {
      throw Error('Missing required CSS class to wait for the notification to display.');
    }

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await this._pageFinder.$('button.e2e-show').click();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const errorFinder = this._pageFinder.$('output.e2e-error');
    await browser.wait(async () => {
      // Test if the notification is showing
      if (await this._appPO.findNotification({cssClass: this._cssClasses}).isDisplayed()) {
        return true;
      }

      // Test if an error is present
      await WebdriverExecutionContexts.switchToIframe(this.viewId);
      if (await errorFinder.isPresent()) {
        return true;
      }

      return false;
    }, 5000);

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    if (await errorFinder.isPresent()) {
      return Promise.reject(await errorFinder.getText());
    }
  }

  public async pressEscape(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.click();
    await sendKeys(Key.ESCAPE);
  }

  /**
   * Opens the page to test the notification in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<NotificationOpenerPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-test-notification', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new NotificationOpenerPagePO(viewId);
  }
}
