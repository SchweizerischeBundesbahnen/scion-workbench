/* eslint-disable */

import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

export interface SciMenu {
  addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => boolean | void): this;

  addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(menuGroupDescriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenu) => SciMenu): this;

  addGroup(groupFactoryFn: (group: SciMenu) => SciMenu): this;
}

/**
 * Defines the properties for a menu item.
 */
export interface SciMenuDescriptor {
  /**
   * Specifies the text label of the menu item.
   */
  label?: Signal<string> | string | ComponentType<unknown>;
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
  size?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
  };
  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
   */
  cssClass?: string | string[];
}

export interface SciMenuItemDescriptor {
  /**
   * Specifies the identifier for the menu item, used to ...
   */
  id?: string;
  label?: Signal<string> | string | ComponentType<unknown>;
  matchesFilter?: (filter: string) => boolean;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: Signal<boolean> | boolean;
  actionToolbarName?: Signal<string | undefined> | string;
  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
   */
  cssClass?: string | string[];
}

export interface SciIconMenuItemDescriptor extends SciMenuItemDescriptor {
  icon: string;
}

export interface SciCheckableMenuItemDescriptor extends SciMenuItemDescriptor {
  checked: Signal<boolean> | boolean;
}

export interface SciMenuGroupDescriptor {
  id?: string;
  label?: Signal<string> | string;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: Signal<boolean> | boolean;
  filter?: boolean | {placeholder?: string; notFoundText?: string};
}

export function openMenu(name: string, anchor: HTMLElement): void {
}
