/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { assertPageToDisplay, enterText, selectOption } from '../../helper/testing.util';
import { AppPO, ViewPO, ViewTabPO } from '../../app.po';
import { SciCheckboxPO, SciParamsEnterPO } from '@scion/toolkit.internal/widgets.po';
import { $, browser, ElementFinder, protractor } from 'protractor';
import { WebdriverExecutionContexts } from '../../helper/webdriver-execution-context';
import { coerceArray } from '@angular/cdk/coercion';
import { RouterOutletPO } from './router-outlet.po';
import { WorkbenchPopupCapability as _WorkbenchPopupCapability, WorkbenchViewCapability as _WorkbenchViewCapability } from '@scion/workbench-client';

const EC = protractor.ExpectedConditions;

/**
 * Protractor runs as node application that fails to start when importing runtime types from `@scion/microfrontend-platform` since
 * it requires the DOM API like HTMLElement not present in node. Unlike classes or enums, interfaces can be referenced
 * because they do not exist at runtime. But importing runtime constructs in PO's or spec's such as the enum `WorkbenchCapabilities`
 * would cause the lib to be bundled as well, resulting in the following runtime error: `E/launcher - Error: ReferenceError:
 * HTMLElement is not defined.`
 *
 * For that reason, we re-declare workbench capability interfaces and replace their `type` property with a string literal.
 */
export type WorkbenchViewCapability = Omit<_WorkbenchViewCapability, 'type'> & { type: 'view', properties: { pinToStartPage?: boolean } };
export type WorkbenchPopupCapability = Omit<_WorkbenchPopupCapability, 'type'> & { type: 'popup' };

/**
 * Page object to interact {@link RegisterWorkbenchCapabilityPageComponent}.
 */
export class RegisterWorkbenchCapabilityPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-register-workbench-capability-page');
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

  /**
   * Registers the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the capability ID upon successful registration, or that rejects on registration error.
   */
  public async registerCapability<T extends WorkbenchViewCapability | WorkbenchPopupCapability>(capability: T): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    if (capability.type !== undefined) {
      await selectOption(capability.type, this._pageFinder.$('select.e2e-type'));
    }
    if (capability.qualifier !== undefined) {
      const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-qualifier'));
      await paramsEnterPO.clear();
      await paramsEnterPO.enterParams(capability.qualifier);
    }
    if (capability.requiredParams) {
      await enterText(capability.requiredParams.join(','), this._pageFinder.$('input.e2e-required-params'));
    }
    if (capability.optionalParams) {
      await enterText(capability.optionalParams.join(','), this._pageFinder.$('input.e2e-optional-params'));
    }
    if (capability.private !== undefined) {
      await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-private')).toggle(capability.private);
    }
    if (capability.properties.path !== undefined) {
      await enterText(capability.properties.path, this._pageFinder.$('input.e2e-path'));
    }
    if (capability.properties.cssClass !== undefined) {
      await enterText(coerceArray(capability.properties.cssClass).join(' '), this._pageFinder.$('input.e2e-class'));
    }

    if (capability.type === 'view') {
      await this.enterViewCapabilityProperties(capability as WorkbenchViewCapability);
    }
    else if (capability.type === 'popup') {
      await this.enterPopupCapabilityProperties(capability as WorkbenchPopupCapability);
    }

    await this.clickRegister();

    // Evaluate the response: resolves the promise on success, or rejects it on error.
    const responseFinder = this._pageFinder.$('output.e2e-register-response');
    const errorFinder = this._pageFinder.$('output.e2e-register-error');
    await browser.wait(EC.or(EC.presenceOf(responseFinder), EC.presenceOf(errorFinder)), 5000);
    if (await responseFinder.isPresent()) {
      return responseFinder.$('span.e2e-capability-id').getText();
    }
    else {
      return Promise.reject(await errorFinder.getText());
    }
  }

  private async enterViewCapabilityProperties(capability: WorkbenchViewCapability): Promise<void> {
    if (capability.properties.title !== undefined) {
      await enterText(capability.properties.title, this._pageFinder.$('input.e2e-title'));
    }
    if (capability.properties.heading !== undefined) {
      await enterText(capability.properties.heading, this._pageFinder.$('input.e2e-heading'));
    }
    if (capability.properties.closable !== undefined) {
      await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).toggle(capability.properties.closable);
    }
    if (capability.properties.pinToStartPage !== undefined) {
      await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-pin-to-startpage')).toggle(capability.properties.pinToStartPage);
    }
  }

  private async enterPopupCapabilityProperties(capability: WorkbenchPopupCapability): Promise<void> {
    const size = capability.properties.size;

    if (size?.width !== undefined) {
      await enterText(size.width, this._pageFinder.$('input.e2e-width'));
    }
    if (size?.height) {
      await enterText(size.height, this._pageFinder.$('input.e2e-height'));
    }
    if (size?.minWidth) {
      await enterText(size.minWidth, this._pageFinder.$('input.e2e-min-width'));
    }
    if (size?.maxWidth) {
      await enterText(size.maxWidth, this._pageFinder.$('input.e2e-max-width'));
    }
    if (size?.minHeight) {
      await enterText(size.minHeight, this._pageFinder.$('input.e2e-min-height'));
    }
    if (size?.maxHeight) {
      await enterText(size.maxHeight, this._pageFinder.$('input.e2e-max-height'));
    }
  }

  public async clickRegister(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await this._pageFinder.$('button.e2e-register').click();
  }

  /**
   * Opens the page in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<RegisterWorkbenchCapabilityPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-register-workbench-capability', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new RegisterWorkbenchCapabilityPagePO(viewId);
  }
}
