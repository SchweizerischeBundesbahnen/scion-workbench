/* eslint-disable */

import {Signal} from '@angular/core';

export interface SciMenu {
  addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => void): this;

  addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(menuGroupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenu) => SciMenu): this;

  addGroup(menuFactoryFn: (group: SciMenu) => SciMenu): this;
}

export interface SciMenuDescriptor {
  text: string;
  icon?: string;
  id?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: () => Signal<boolean> | boolean;
}

export interface SciMenuItemDescriptor {
  text: string;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: () => Signal<boolean> | boolean;
}

export interface SciIconMenuItemDescriptor extends SciMenuItemDescriptor {
  icon: string;
}

export interface SciCheckableMenuItemDescriptor extends SciMenuItemDescriptor {
  checked: () => Signal<boolean> | boolean;
}

export interface SciMenuGroupDescriptor {
  id?: string;
  label?: string;
}

export function openMenu(name: string, anchor: HTMLElement): void {
}
