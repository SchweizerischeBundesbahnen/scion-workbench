/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, pressModifierThenClick, selectOption} from '../../helper/testing.util';
import {Params} from '@angular/router';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {SciCheckboxPO, SciParamsEnterPO} from '@scion/toolkit.internal/widgets.po';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {Dictionary} from '@scion/toolkit/util';

/**
 * Page object to interact {@link RouterPageComponent}.
 */
export class RouterPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = this.viewPO.$('app-router-page');
  }

  public async isPresent(): Promise<boolean> {
    if (!await this.viewTabPO.isPresent()) {
      return false;
    }

    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isPresent();
  }

  public async enterPath(path: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(path, this._pageFinder.$('input.e2e-path'));
  }

  public async enterMatrixParams(params: Params): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-matrix-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterQueryParams(params: Params): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-query-params'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(params);
  }

  public async enterNavigationalState(state: Dictionary): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-navigational-state'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(state);
  }

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-activate-if-present')).toggle(check);
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-close-if-present')).toggle(check);
  }

  public async selectTarget(target: 'self' | 'blank'): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await selectOption(target, this._pageFinder.$('select.e2e-target'));
  }

  public async enterInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(`${insertionIndex}`, this._pageFinder.$('input.e2e-insertion-index'));
  }

  public async enterSelfViewId(selfViewId: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(selfViewId, this._pageFinder.$('input.e2e-self-view-id'));
  }

  public async clickNavigateViaRouter(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-router-navigate').click();
  }

  /**
   * Clicks on the router link, optionally pressing the specified modifier key.
   * The modifier key must be one of {ALT, CONTROL, SHIFT, COMMAND, META}.
   */
  public async clickNavigateViaRouterLink(modifierKey?: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    if (modifierKey) {
      await pressModifierThenClick(this._pageFinder.$('a.e2e-router-link-navigate'), modifierKey);
    }
    else {
      await this._pageFinder.$('a.e2e-router-link-navigate').click();
    }
  }

  /**
   * Opens the page to test the router in a new view tab.
   */
  public static async openInNewTab(): Promise<RouterPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openWorkbenchView('e2e-test-router');
    const viewId = await appPO.findActiveView().getViewId();
    return new RouterPagePO(viewId);
  }
}
