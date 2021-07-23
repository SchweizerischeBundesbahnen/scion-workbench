/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {$, browser, ElementFinder, protractor} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';

const EC = protractor.ExpectedConditions;

/**
 * Page object to interact {@link UnregisterWorkbenchCapabilityPageComponent}.
 */
export class UnregisterWorkbenchCapabilityPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-unregister-workbench-capability-page');
  }

  /**
   * Unregisters the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves upon successful unregistration, or that rejects on error.
   */
  public async unregisterCapability(id: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    await this.enterId(id);
    await this.clickUnregister();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const responseFinder = this._pageFinder.$('output.e2e-unregistered');
    const errorFinder = this._pageFinder.$('output.e2e-unregister-error');
    await browser.wait(EC.or(EC.presenceOf(responseFinder), EC.presenceOf(errorFinder)), 5000);
    if (await responseFinder.isPresent()) {
      return Promise.resolve();
    }
    else {
      return Promise.reject(await errorFinder.getText());
    }
  }

  public async enterId(id: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(id, this._pageFinder.$('input.e2e-id'));
  }

  public async clickUnregister(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-unregister').click();
  }

  /**
   * Opens the page in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<UnregisterWorkbenchCapabilityPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-unregister-workbench-capability', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new UnregisterWorkbenchCapabilityPagePO(viewId);
  }
}
