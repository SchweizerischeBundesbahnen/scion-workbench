/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Handle for interacting with the content of a workbench part.
 */
export class PartSlotPO {

  public readonly viewport: Locator;

  constructor(public readonly locator: Locator) {
    this.viewport = this.locator.locator('> sci-viewport');
  }
}
