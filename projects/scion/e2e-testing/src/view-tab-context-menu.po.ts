/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isPresent} from './helper/testing.util';
import {Locator} from '@playwright/test';

/**
 * Page object to interact with {@link ViewMenuComponent}.
 */
export class ViewTabContextMenuPO {

  public readonly menuItems = {
    closeTab: new ContextMenuItem(this._locator.locator('button.e2e-close-tab')),
    closeAll: new ContextMenuItem(this._locator.locator('button.e2e-close-all-tabs')),
    moveToNewWindow: new ContextMenuItem(this._locator.locator('button.e2e-move-to-new-window')),
  };

  constructor(private _locator: Locator) {
  }

  /**
   * Indicates whether the context menu is opened.
   */
  public isOpened(): Promise<boolean> {
    return isPresent(this._locator);
  }
}

export class ContextMenuItem {

  constructor(public locator: Locator) {
  }

  public async click(): Promise<void> {
    await this.locator.click();
  }
}
