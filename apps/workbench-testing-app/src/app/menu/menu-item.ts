/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents a menu item in the menu.
 */
export class MenuItem {
  /**
   * Specifies the content of the menu item.
   */
  public text: string;
  /**
   * Sets the listener invoked when the user performs the menu action.
   */
  public onAction: () => any | Promise<any>;
  /**
   * Disables the menu item.
   */
  public disabled?: boolean;
  /**
   * Specifies CSS class(es) to be added to the menu item, useful in end-to-end tests for locating the menu item.
   */
  public cssClass?: string | string[];

  constructor(menuItem: MenuItem) {
    Object.assign(this, menuItem);
  }
}

/**
 * Represents a separator in the menu.
 */
export class MenuItemSeparator {
}
