/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MessageBoxPO} from './message-box.po';
import {Locator} from '@playwright/test';
import {WorkbenchMessageBoxPagePO} from './workbench/page-object/workbench-message-box-page.po';

/**
 * Page object to interact with {@link MessageBoxPageComponent}.
 */
export class MessageBoxPagePO implements WorkbenchMessageBoxPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;
  public readonly param1: Locator;
  public readonly param2: Locator;

  constructor(public messageBox: MessageBoxPO) {
    this.locator = messageBox.locator.locator('app-message-box-page');
    this.input = this.locator.locator('output.e2e-input');
    this.param1 = this.locator.locator('output.e2e-param1');
    this.param2 = this.locator.locator('output.e2e-param2');
  }
}
