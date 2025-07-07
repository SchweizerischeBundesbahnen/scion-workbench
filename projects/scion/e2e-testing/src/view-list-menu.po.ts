/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object to interact with {@link ViewListComponent}.
 */
export class ViewListMenuPO {

  public readonly filter: Locator;

  constructor(public locator: Locator) {
    this.filter = this.locator.locator('wb-filter-field.e2e-view-filter > input');
  }
}
