/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../view.po';

/**
 * Page object to interact with {@link UnregisterWorkbenchCapabilityPageComponent}.
 */
export class UnregisterWorkbenchCapabilityPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(public view: ViewPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(view.locator.page(), {name: view.locateBy?.id, cssClass: view.locateBy?.cssClass});
    this.locator = (options?.host ? view.locator : this.outlet.frameLocator).locator('app-unregister-workbench-capability-page');
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
    const responseLocator = this.locator.locator('output.e2e-unregistered');
    const errorLocator = this.locator.locator('output.e2e-unregister-error');
    return Promise.race([
      waitUntilAttached(responseLocator),
      rejectWhenAttached(errorLocator),
    ]);
  }

  public async enterId(id: string): Promise<void> {
    await this.locator.locator('input.e2e-id').fill(id);
  }

  public async clickUnregister(): Promise<void> {
    await this.locator.locator('button.e2e-unregister').click();
  }
}
