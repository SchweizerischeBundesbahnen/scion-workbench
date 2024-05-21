/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Intention} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {Application} from './application';

/**
 * Page object to interact with {@link RegisterIntentionPageComponent}.
 */
export class RegisterIntentionPagePO {

  constructor(public locator: Locator) {
  }

  /**
   * Registers the given intention.
   *
   * Returns a Promise that resolves to the intention ID upon successful registration, or that rejects on registration error.
   */
  public async registerIntention(application: Application, intention: Intention): Promise<string> {
    await this.locator.locator('select.e2e-application').selectOption(application);
    await this.locator.locator('input.e2e-type').fill(intention.type);
    if (intention.qualifier !== undefined) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
      await keyValueField.clear();
      await keyValueField.addEntries(intention.qualifier);
    }

    // Register intention.
    await this.locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this.locator.locator('output.e2e-register-response');
    const errorLocator = this.locator.locator('output.e2e-register-error');
    await Promise.race([
      waitUntilAttached(responseLocator),
      rejectWhenAttached(errorLocator),
    ]);
    return responseLocator.locator('span.e2e-intention-id').innerText();
  }
}
