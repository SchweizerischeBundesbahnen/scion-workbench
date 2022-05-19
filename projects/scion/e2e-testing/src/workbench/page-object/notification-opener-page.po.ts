/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, selectOption, sendKeys} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {browser, ElementFinder, Key} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {SciCheckboxPO} from '../../../deps/scion/components.internal/checkbox.po';
import {Arrays} from '../../../deps/scion/toolkit/util';

/**
 * Page object to interact {@link NotificationPageComponent}.
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
    this._pageFinder = this.viewPO.$('app-notification-opener-page');
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.isPresent();
  }

  public async selectComponent(component: 'inspect-notification' | 'default'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(component, this._pageFinder.$('select.e2e-component'));
  }

  public async enterContent(content: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(content, this._pageFinder.$('input.e2e-content'));
  }

  public async enterComponentInput(componentInput: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(componentInput, this._pageFinder.$('input.e2e-component-input'));
  }

  public async enterTitle(title: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(severity, this._pageFinder.$('select.e2e-severity'));
  }

  public async selectDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(`${duration}`, this._pageFinder.$('input.e2e-duration'));
  }

  public async enterGroup(group: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(group, this._pageFinder.$('input.e2e-group'));
  }

  public async checkUseGroupInputReduceFn(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-use-group-input-reducer')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    this._cssClasses = Arrays.coerce(cssClass);
    await enterText(this._cssClasses.join(' '), this._pageFinder.$('input.e2e-class'));
  }

  public async clickShow(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    if (!this._cssClasses || !this._cssClasses.length) {
      throw Error('Missing required CSS class to wait for the notification to display.');
    }

    await this._pageFinder.$('button.e2e-show').click();
    await browser.wait(() => this._appPO.findNotification({cssClass: this._cssClasses}).isDisplayed(), 5000);
  }

  public async pressEscape(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.click();
    await sendKeys(Key.ESCAPE);
  }

  /**
   * Opens the page to test the notification in a new view tab.
   */
  public static async openInNewTab(): Promise<NotificationOpenerPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openWorkbenchView('e2e-test-notification');
    const viewId = await appPO.findActiveView().getViewId();
    return new NotificationOpenerPagePO(viewId);
  }
}
