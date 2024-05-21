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

/**
 * Page object to interact with {@link PublishMessagePageComponent}.
 */
export class PublishMessagePagePO {

  constructor(public locator: Locator) {
  }

  /**
   * Publishes a message to the given topic.
   */
  public async publishMessage(topic: string): Promise<void> {
    await this.locator.locator('input.e2e-topic').fill(topic);
    await this.locator.locator('button.e2e-publish').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const successLocator = this.locator.locator('output.e2e-publish-success');
    const errorLocator = this.locator.locator('output.e2e-publish-error');
    await Promise.race([
      waitUntilAttached(successLocator),
      rejectWhenAttached(errorLocator),
    ]);
  }
}
