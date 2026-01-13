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
import {ViewPO} from '../../../view.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';

export class StandaloneViewTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;

  constructor(public view: ViewPO) {
    this.locator = view.locator.locator('app-standalone-view-test-page');
  }
}
