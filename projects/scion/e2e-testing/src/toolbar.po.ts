/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ToolbarItemPO} from './toolbar-item.po';

export class ToolbarPO {

  constructor(public locator: Locator) {
  }

  public item(locateBy: {cssClass: string}): ToolbarItemPO {
    return new ToolbarItemPO(this.locator.locator(`.${locateBy.cssClass}`));
  }
}
