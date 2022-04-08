/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, selectOption} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {$, browser, ElementFinder, protractor} from 'protractor';
import {Qualifier} from '@scion/microfrontend-platform';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {RouterOutletPO} from './router-outlet.po';
import {SciParamsEnterPO} from '../../../deps/scion/toolkit.internal/params-enter/params-enter.po';
import {Dictionary} from '../../../deps/scion/toolkit/dictionaries.util';
import {SciCheckboxPO} from '../../../deps/scion/toolkit.internal/checkbox/checkbox.po';

const EC = protractor.ExpectedConditions;

/**
 * Page object to interact {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-router-page');
  }

  public async isPresent(): Promise<boolean> {
    if (!await this.viewTabPO.isPresent()) {
      return false;
    }

    if (!await new RouterOutletPO().isPresent(this.viewId)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    return this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    if (!await this.viewPO.isPresent()) {
      return false;
    }

    if (!await new RouterOutletPO().isDisplayed(this.viewId)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    return await this._pageFinder.isPresent() && await this._pageFinder.isDisplayed();
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

  public async selectTarget(target: 'self' | 'blank'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(target, this._pageFinder.$('select.e2e-target'));
  }

  public async enterSelfViewId(selfViewId: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(selfViewId, this._pageFinder.$('input.e2e-self-view-id'));
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(`${insertionIndex}`, this._pageFinder.$('input.e2e-insertion-index'));
  }

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-activate-if-present')).toggle(check);
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-close-if-present')).toggle(check);
  }

  /**
   * Clicks navigate.
   *
   * Set `evalNavigateResponse` to `false` when replacing the current microfrontend,
   * as this unloads the current router page.
   */
  public async clickNavigate(options?: {evalNavigateResponse?: boolean}): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-navigate').click();

    if (!(options?.evalNavigateResponse ?? true)) {
      return;
    }

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const navigatedFinder = this._pageFinder.$('output.e2e-navigated');
    const errorFinder = this._pageFinder.$('output.e2e-navigate-error');
    await browser.wait(EC.or(EC.presenceOf(navigatedFinder), EC.presenceOf(errorFinder)), 5000);
    if (await navigatedFinder.isPresent()) {
      return;
    }
    else {
      throw Error(await errorFinder.getText());
    }
  }

  /**
   * Opens the page in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<RouterPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-test-router', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new RouterPagePO(viewId);
  }
}
