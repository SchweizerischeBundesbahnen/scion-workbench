/* eslint-disable */

import {Signal} from '@angular/core';

export interface SciMenu {
  addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => void): this;

  addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(menuGroupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenu) => SciMenu): this;

  addGroup(menuFactoryFn: (group: SciMenu) => SciMenu): this;
}

export interface SciMenuDescriptor {
  label?: string;
  icon?: string;
  id?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: Signal<boolean> | boolean;
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
