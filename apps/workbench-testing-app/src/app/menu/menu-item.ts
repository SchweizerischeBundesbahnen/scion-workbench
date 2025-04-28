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
  public onAction: () => unknown | Promise<unknown>;
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
  /**
   * Specifies attribute(s) to add to the menu item.
   */
  public attributes?: {[name: string]: string};
  /**
   * Specifies actions to add to the menu item.
   *
   * Actions are displayed when hovering over the menu item or when the menu item is checked.
   */
  public actions?: MenuAction[];

  constructor(menuItem: MenuItem) {
    this.text = menuItem.text;
    this.onAction = menuItem.onAction;
    this.disabled = menuItem.disabled;
    this.cssClass = menuItem.cssClass;
    this.checked = menuItem.checked;
    this.attributes = menuItem.attributes;
    this.actions = menuItem.actions;
  }
}

/**
 * Represents an action of a menu item.
 */
export interface MenuAction {
  /**
   * Specifies the icon.
   */
  icon: string;
  /**
   * Specifies the tooltip.
   */
  tooltip: string;
  /**
   * Sets the listener invoked when the user performs the action.
   *
   * The function can call `inject` to get any required dependencies.
   */
  onAction: () => unknown | Promise<unknown>;
}

/**
 * Represents a separator in the menu.
 */
export class MenuItemSeparator {

  /**
   * @param heading - Optional heading to display after the separator.
   */
  constructor(public heading?: string) {
  }
}
