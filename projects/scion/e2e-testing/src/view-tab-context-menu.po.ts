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
 * Page object to interact with {@link ViewMenuComponent}.
 */
export class ViewTabContextMenuPO {

  public readonly menuItems: {
    closeTab: ContextMenuItem;
    closeAll: ContextMenuItem;
    moveToNewWindow: ContextMenuItem;
    moveView: ContextMenuItem;
    showViewInfo: ContextMenuItem;
  };

  constructor(public locator: Locator) {
    this.menuItems = {
      closeTab: new ContextMenuItem(this.locator.locator('button.e2e-close')),
      closeAll: new ContextMenuItem(this.locator.locator('button.e2e-close-all-tabs')),
      moveToNewWindow: new ContextMenuItem(this.locator.locator('button.e2e-move-to-new-window')),
      moveView: new ContextMenuItem(this.locator.locator('button.e2e-move-view')),
      showViewInfo: new ContextMenuItem(this.locator.locator('button.e2e-show-view-info')),
    };
  }

  public async pressEscape(): Promise<void> {
    await this.locator.page().keyboard.press('Escape');
  }
}

export class ContextMenuItem {

  constructor(public locator: Locator) {
  }

  public async click(): Promise<void> {
    await this.locator.click();
  }
}
