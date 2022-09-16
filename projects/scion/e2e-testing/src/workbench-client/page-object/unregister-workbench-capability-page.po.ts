/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO, ViewTabPO} from '../../app.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact {@link UnregisterWorkbenchCapabilityPageComponent}.
 */
export class UnregisterWorkbenchCapabilityPagePO {

  private readonly _locator: Locator;

  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewTabPO = appPO.findViewTab({viewId: viewId});
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-unregister-workbench-capability-page');
  }

  /**
   * Unregisters the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves upon successful unregistration, or that rejects on error.
   */
  public async unregisterCapability(id: string): Promise<void> {
    await this.enterId(id);
    await this.clickUnregister();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this._locator.locator('output.e2e-unregistered');
    const errorLocator = this._locator.locator('output.e2e-unregister-error');
    return Promise.race([
      responseLocator.waitFor({state: 'attached'}),
      errorLocator.waitFor({state: 'attached'}).then(() => errorLocator.innerText()).then(error => Promise.reject(Error(error))),
    ]);
  }

  public async enterId(id: string): Promise<void> {
    await this._locator.locator('input.e2e-id').fill(id);
  }

  public async clickUnregister(): Promise<void> {
    await this._locator.locator('button.e2e-unregister').click();
  }
}

