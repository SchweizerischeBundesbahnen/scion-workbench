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

/**
 * Page object to interact with {@link SelectionListenerPageComponent}.
 */
export class SelectionListenerPagePO {

  constructor(public locator: Locator) {
  }

  public async getSelection(): Promise<{[type: string]: unknown[]}> {
    return JSON.parse(await this.locator.locator('div.e2e-selection').innerText());
  }

  public async subscribe(): Promise<void> {
    await this.locator.locator('button.e2e-subscribe').click();
  }

  public async unsubscribe(): Promise<void> {
    await this.locator.locator('button.e2e-unsubscribe').click();
  }
}
