/* eslint-disable */

import {Component, input, Signal} from '@angular/core';
import {Disposable} from '@scion/workbench';

export interface Menu {
  addMenuItem(menuItemDescriptor: MenuItemDescriptor | IconMenuItemDescriptor | CheckableMenuItemDescriptor, onSelect: () => void): this;

  addMenu(menuDescriptor: MenuDescriptor, menuFactoryFn: (menu: Menu) => Menu): this;

  addGroup(menuGroupDescriptor: MenuGroupDescriptor, menuFactoryFn?: (group: Menu) => Menu): this;

  addGroup(menuFactoryFn: (group: Menu) => Menu): this;
}

export interface MenuDescriptor {
  text: string;
  icon?: string;
  id?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: () => Signal<boolean> | boolean;
}

export interface MenuItemDescriptor {
  text: string;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: () => Signal<boolean> | boolean;
}

export interface IconMenuItemDescriptor extends MenuItemDescriptor {
  icon: string;
}

export interface CheckableMenuItemDescriptor extends MenuItemDescriptor {
  checked: () => Signal<boolean> | boolean;
}

export interface MenuGroupDescriptor {
  id?: string;
  label?: string;
}

export function provideMenu(name: string, menuFactoryFn: (menu: Menu) => Menu, options?: ProvideMenuOptions): Disposable {
  return undefined as unknown as Disposable;
}

export interface ProvideMenuOptions {
  canMatch?: () => boolean;
}

export function openMenu(name: string, anchor: HTMLElement): void {
}

@Component({selector: 'sci-toolbar', template: ''})
export class SciToolbar {

  public location = input.required<string>();
}
