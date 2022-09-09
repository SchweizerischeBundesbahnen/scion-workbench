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
import {AppPO, ViewTabPO} from '../../app.po';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';
import {WorkbenchPopupCapability as _WorkbenchPopupCapability, WorkbenchViewCapability as _WorkbenchViewCapability} from '@scion/workbench-client';

/**
 * Playwright's test runner fails to compile when importing runtime types from `@scion/workbench` or `@scion/microfrontend-platform`, because
 * it requires ESM to be configured to run the E2E tests. We wait for better IDE support before configuring ESM for this project.
 *
 * Unlike classes or enums, interfaces can be referenced because they do not exist at runtime.
 * For that reason, we re-declare workbench capability interfaces and replace their `type` property (enum) with a string literal.
 */
export type WorkbenchViewCapability = Omit<_WorkbenchViewCapability, 'type'> & {type: 'view'; properties: {pinToStartPage?: boolean}};
export type WorkbenchPopupCapability = Omit<_WorkbenchPopupCapability, 'type'> & {type: 'popup'};

/**
 * Page object to interact {@link RegisterWorkbenchCapabilityPageComponent}.
 */
export class RegisterWorkbenchCapabilityPagePO {

  private readonly _locator: Locator;

  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewTabPO = appPO.findViewTab({viewId: viewId});
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutlet(viewId)).locator('app-register-workbench-capability-page');
  }

  /**
   * Registers the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the capability ID upon successful registration, or that rejects on registration error.
   */
  public async registerCapability<T extends WorkbenchViewCapability | WorkbenchPopupCapability>(capability: T): Promise<string> {
    await assertElementVisible(this._locator);

    if (capability.type !== undefined) {
      await this._locator.locator('select.e2e-type').selectOption(capability.type);
    }
    if (capability.qualifier !== undefined) {
      const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
      await paramsEnterPO.clear();
      await paramsEnterPO.enterParams(capability.qualifier);
    }
    const requiredParams = capability.params?.filter(param => param.required && !param.transient).map(param => param.name);
    const optionalParams = capability.params?.filter(param => !param.required && !param.transient).map(param => param.name);
    const transientParams = capability.params?.filter(param => param.transient).map(param => param.name);
    if (requiredParams?.length) {
      await this._locator.locator('input.e2e-required-params').fill(requiredParams.join(','));
    }
    if (optionalParams?.length) {
      await this._locator.locator('input.e2e-optional-params').fill(optionalParams.join(','));
    }
    if (transientParams?.length) {
      await this._locator.locator('input.e2e-transient-params').fill(transientParams.join(','));
    }
    if (capability.private !== undefined) {
      await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-private')).toggle(capability.private);
    }
    if (capability.properties.path !== undefined) {
      await this._locator.locator('input.e2e-path').fill(capability.properties.path);
    }
    if (capability.properties.cssClass !== undefined) {
      await this._locator.locator('input.e2e-class').fill(coerceArray(capability.properties.cssClass).join(' '));
    }

    if (capability.type === 'view') {
      await this.enterViewCapabilityProperties(capability as WorkbenchViewCapability);
    }
    else if (capability.type === 'popup') {
      await this.enterPopupCapabilityProperties(capability as WorkbenchPopupCapability);
    }

    await this.clickRegister();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this._locator.locator('output.e2e-register-response');
    const errorLocator = this._locator.locator('output.e2e-register-error');
    return Promise.race([
      responseLocator.waitFor({state: 'attached'}).then(() => responseLocator.locator('span.e2e-capability-id').innerText()),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }

  private async enterViewCapabilityProperties(capability: WorkbenchViewCapability): Promise<void> {
    if (capability.properties.title !== undefined) {
      await this._locator.locator('input.e2e-title').fill(capability.properties.title);
    }
    if (capability.properties.heading !== undefined) {
      await this._locator.locator('input.e2e-heading').fill(capability.properties.heading);
    }
    if (capability.properties.closable !== undefined) {
      await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-closable')).toggle(capability.properties.closable);
    }
    if (capability.properties.pinToStartPage !== undefined) {
      await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-pin-to-startpage')).toggle(capability.properties.pinToStartPage);
    }
  }

  private async enterPopupCapabilityProperties(capability: WorkbenchPopupCapability): Promise<void> {
    const size = capability.properties.size;

    if (size?.width !== undefined) {
      await this._locator.locator('input.e2e-width').fill(size.width);
    }
    if (size?.height) {
      await this._locator.locator('input.e2e-height').fill(size.height);
    }
    if (size?.minWidth) {
      await this._locator.locator('input.e2e-min-width').fill(size.minWidth);
    }
    if (size?.maxWidth) {
      await this._locator.locator('input.e2e-max-width').fill(size.maxWidth);
    }
    if (size?.minHeight) {
      await this._locator.locator('input.e2e-min-height').fill(size.minHeight);
    }
    if (size?.maxHeight) {
      await this._locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
  }

  private async clickRegister(): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('button.e2e-register').click();
  }
}
