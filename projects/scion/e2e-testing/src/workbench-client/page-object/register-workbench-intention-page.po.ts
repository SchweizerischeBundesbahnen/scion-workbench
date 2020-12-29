/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO, ViewPO, ViewTabPO } from '../../app.po';
import { SciParamsEnterPO } from '@scion/toolkit.internal/widgets.po';
import { $, browser, ElementFinder, protractor } from 'protractor';
import { Intention, Qualifier } from '@scion/microfrontend-platform';
import { WebdriverExecutionContexts } from '../../helper/webdriver-execution-context';
import { assertPageToDisplay, selectOption } from '../../helper/testing.util';

const EC = protractor.ExpectedConditions;

/**
 * Page object to interact {@link RegisterWorkbenchIntentionPageComponent}.
 */
export class RegisterWorkbenchIntentionPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-register-workbench-intention-page');
  }

  /**
   * Registers the given workbench intention.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the intention ID upon successful registration, or that rejects on registration error.
   */
  public async registerIntention(intention: Intention & { type: 'view' }): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    await this.selectType(intention.type);
    await this.enterQualifier(intention.qualifier);
    await this.clickRegister();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const responseFinder = this._pageFinder.$('output.e2e-register-response');
    const errorFinder = this._pageFinder.$('output.e2e-register-error');
    await browser.wait(EC.or(EC.presenceOf(responseFinder), EC.presenceOf(errorFinder)), 5000);
    if (await responseFinder.isPresent()) {
      return responseFinder.$('span.e2e-intention-id').getText();
    }
    else {
      return Promise.reject(await errorFinder.getText());
    }
  }

  public async selectType(type: 'view'): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await selectOption(type, this._pageFinder.$('select.e2e-type'));
  }

  public async enterQualifier(qualifier: Qualifier): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    await paramsEnterPO.enterParams(qualifier);
  }

  public async clickRegister(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-register').click();
  }

  /**
   * Opens the page in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<RegisterWorkbenchIntentionPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-register-workbench-intention', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new RegisterWorkbenchIntentionPagePO(viewId);
  }
}
