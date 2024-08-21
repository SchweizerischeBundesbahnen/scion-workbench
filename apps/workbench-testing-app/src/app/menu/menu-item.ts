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
   *
   * The function can call `inject` to get any required dependencies.
   */
  public onAction: () => any | Promise<any>;
  /**
   * Disables the menu item.
   */
  public disabled?: boolean;
  /**
   * Indicates whether to display a check mark left to the menu item.
   */
  public checked?: boolean;
  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
   */
  public cssClass?: string | string[];

  constructor(menuItem: MenuItem) {
    this.text = menuItem.text;
    this.onAction = menuItem.onAction;
    this.disabled = menuItem.disabled;
    this.cssClass = menuItem.cssClass;
    this.checked = menuItem.checked;
  }
}

/**
 * Represents a separator in the menu.
 */
export class MenuItemSeparator {
}
