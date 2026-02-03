/* eslint-disable */

import {Signal} from '@angular/core';

export interface SciMenu {
  addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => void): this;

  addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(menuGroupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenu) => SciMenu): this;

  addGroup(menuFactoryFn: (group: SciMenu) => SciMenu): this;
}

/**
 * Defines the properties for a menu item.
 */
export interface SciMenuDescriptor {
  /**
   * Specifies the text label of the menu item.
   */
  label?: string;
  /**
   * Specifies the icon associated with the menu item.
   */
  icon?: string;
  /**
   * Specifies the identifier for the menu item, used to contribute to the menu.
   */
  id?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: Signal<boolean> | boolean;
  /**
   * Controls the display of a visual marker for menu dropdown.
   *
   * Is only displayed for menus in the toolbar.
   *
   * Defaults to `true`.
   */
  visualMenuMarker?: boolean;
  filter?: boolean | {placeholder?: string; notFoundText?: string};
}

export interface SciMenuItemDescriptor {
  label?: string;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: Signal<boolean> | boolean;
}

export interface SciIconMenuItemDescriptor extends SciMenuItemDescriptor {
  icon: string;
}

export interface SciCheckableMenuItemDescriptor extends SciMenuItemDescriptor {
  checked: Signal<boolean> | boolean;
}

export interface SciMenuGroupDescriptor {
  id?: string;
  label?: string;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: Signal<boolean> | boolean;
  filter?: boolean | {placeholder?: string; notFoundText?: string};
}

export function openMenu(name: string, anchor: HTMLElement): void {
}
