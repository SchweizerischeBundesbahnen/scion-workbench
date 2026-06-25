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
import {MenuItemPO} from './menu-item.po';

/**
 * Page object to interact with menu of view.
 */
export class ViewTabContextMenuPO {

  public readonly menuItems: {
    closeTab: MenuItemPO;
    closeAll: MenuItemPO;
    moveToNewWindow: MenuItemPO;
    moveView: MenuItemPO;
    showViewInfo: MenuItemPO;
  };

  constructor(public locator: Locator) {
    this.menuItems = {
      closeTab: new MenuItemPO(this.locator.locator('button.e2e-close')),
      closeAll: new MenuItemPO(this.locator.locator('button.e2e-close-all-tabs')),
      moveToNewWindow: new MenuItemPO(this.locator.locator('button.e2e-move-to-new-window')),
      moveView: new MenuItemPO(this.locator.locator('button.e2e-move-view')),
      showViewInfo: new MenuItemPO(this.locator.locator('button.e2e-show-view-info')),
    };
  }

  public async pressEscape(): Promise<void> {
    await this.locator.page().keyboard.press('Escape');
  }
}
