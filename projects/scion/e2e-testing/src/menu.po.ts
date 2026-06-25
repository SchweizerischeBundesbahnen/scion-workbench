/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {Arrays} from '@scion/toolkit/util';

/**
 * Page object to interact with `sci-menu` component.
 */
export class MenuPO {

  public readonly filter: Locator;

  constructor(public locator: Locator) {
    this.filter = this.locator.locator('sci-menu-filter > input');
  }

  public async clickMenuItem(locateBy: {cssClass: string | string[]}, options?: {check?: boolean}): Promise<void> {
    const cssClasses = Arrays.coerce(locateBy.cssClass);
    let menu: MenuPO = this; // eslint-disable-line @typescript-eslint/no-this-alias

    for (let i = 0; i < cssClasses.length - 1; i++) {
      menu = await menu.openSubMenu(cssClasses[i]!);
    }

    const menuItem = menu.locator.locator(`button.e2e-menu-item.${cssClasses.at(-1)!}`);

    // Do not toggle the menu item if already in the expected state.
    if (options?.check !== undefined && (await menuItem.locator('span.e2e-check-mark').isVisible()) === options.check) {
      return this.locator.page().keyboard.press('Escape');
    }

    await menuItem.click();
  }

  private async openSubMenu(cssClass: string): Promise<MenuPO> {
    const menuItem = this.locator.locator(`button.e2e-menu-item.${cssClass}`);

    // Hover menu item to open sub menu.
    await menuItem.hover();

    // Locate sub menu.
    const subMenu = new MenuPO(this.locator.locator('sci-menu'));

    // Wait for sub menu to be visible.
    await subMenu.locator.waitFor({state: 'visible'});

    return subMenu;
  }
}
