/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {Application} from './application';

/**
 * Page object to interact with {@link UnregisterCapabilityPageComponent}.
 */
export class UnregisterCapabilityPagePO {

  constructor(public locator: Locator) {
  }

  /**
   * Unregisters the given capability.
   *
   * Returns a Promise that resolves upon successful unregistration, or that rejects on error.
   */
  public async unregisterCapability(application: Application, id: string): Promise<void> {
    await this.locator.locator('select.e2e-application').selectOption(application);
    await this.locator.locator('input.e2e-id').fill(id);
    await this.locator.locator('button.e2e-unregister').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this.locator.locator('output.e2e-unregistered');
    const errorLocator = this.locator.locator('output.e2e-unregister-error');
    return Promise.race([
      waitUntilAttached(responseLocator),
      rejectWhenAttached(errorLocator),
    ]);
  }
}
