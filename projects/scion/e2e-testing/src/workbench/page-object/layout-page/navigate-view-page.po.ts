/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, commandsToPath, rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {Locator} from '@playwright/test';
import {Commands, ViewState} from '@scion/workbench';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';

/**
 * Page object to interact with {@link NavigateViewPageComponent}.
 */
export class NavigateViewPagePO {

  constructor(public locator: Locator) {
  }

  public async navigateView(viewId: string, commands: Commands, extras?: {outlet?: string; state?: ViewState; cssClass?: string | string[]}): Promise<void> {
    await this.locator.locator('input.e2e-view-id').fill(viewId);
    await this.locator.locator('input.e2e-commands').fill(commandsToPath(commands));
    await this.locator.locator('input.e2e-outlet').fill(extras?.outlet ?? '');
    await this.locator.locator('input.e2e-css-class').fill(coerceArray(extras?.cssClass).join(' '));
    await this.enterState(extras?.state);

    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-navigate-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }

  public async enterState(state: ViewState | undefined): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-state'));
    await keyValueField.clear();
    await keyValueField.addEntries(state ?? {});
  }
}
