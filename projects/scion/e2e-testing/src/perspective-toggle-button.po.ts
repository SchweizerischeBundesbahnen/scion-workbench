/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {hasCssClass} from './helper/testing.util';

/**
 * Handle for interacting with a workbench perspective.
 */
export class PerspectiveTogglePO {

  constructor(private readonly _locator: Locator) {
  }

  public async click(): Promise<void> {
    return this._locator.click();
  }

  public async isActive(): Promise<boolean> {
    return hasCssClass(this._locator, 'e2e-active');
  }
}
