/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, selectOption} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {SciCheckboxPO, SciParamsEnterPO} from '@scion/toolkit.internal/widgets.po';
import {$, browser, ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {Qualifier} from '@scion/microfrontend-platform';
import {Dictionary} from '@scion/toolkit/util';
import {coerceArray} from '@angular/cdk/coercion';

/**
 * Page object to interact {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-message-box-opener-page');
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

  public async enterActions(actions: Dictionary<string>): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-actions'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(actions);
  }

  public async selectSeverity(severity: 'info' | 'warn' | 'error'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(severity, this._pageFinder.$('select.e2e-severity'));
  }

  public async selectModality(modality: 'view' | 'application'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(modality, this._pageFinder.$('select.e2e-modality'));
  }

  public async checkContentSelectable(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-content-selectable')).toggle(check);
  }

  public async checkViewContextActive(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-view-context')).toggle(check);
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(coerceArray(cssClass).join(' '), this._pageFinder.$('input.e2e-class'));
  }

  public async clickOpen(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const expectedMessageBoxCount = await this._appPO.getMessageBoxCount() + 1;

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await this._pageFinder.$('button.e2e-open').click();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const errorFinder = this._pageFinder.$('output.e2e-open-error');
    await browser.wait(async () => {
      // Test if the message box has opened
      await WebdriverExecutionContexts.switchToDefault();
      const actualMessageBoxCount = await this._appPO.getMessageBoxCount();
      if (actualMessageBoxCount === expectedMessageBoxCount) {
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
      throw Error(await errorFinder.getText());
    }
  }

  public async getMessageBoxCloseAction(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('output.e2e-close-action').getText();
  }

  /**
   * Opens the page to test the message box in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<MessageBoxOpenerPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-test-message-box', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new MessageBoxOpenerPagePO(viewId);
  }
}
