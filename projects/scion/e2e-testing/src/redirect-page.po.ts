/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact with {@link RedirectComponent}.
 */
export class RedirectPagePO {

  public readonly locator: Locator;

  constructor(appPO: AppPO) {
    this.locator = appPO.page.locator('app-redirect');
  }
}
