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
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewPO} from '../../../view.po';

export class NavigationTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;

  constructor(public view: ViewPO) {
    this.locator = view.locator.locator('app-navigation-test-page');
  }
}
