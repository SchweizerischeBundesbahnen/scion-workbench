/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {isPresent} from './helper/testing.util';

/**
 * Handle for interacting with a part action.
 */
export class PartActionPO {

  constructor(private readonly _locator: Locator) {
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async click(): Promise<void> {
    return this._locator.click();
  }
}
