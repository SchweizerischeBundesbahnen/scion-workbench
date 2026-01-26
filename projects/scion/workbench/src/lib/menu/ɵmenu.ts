import {SciCheckableMenuItemDescriptor, SciIconMenuItemDescriptor, SciMenu, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/workbench';
import {Signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';

export class ɵSciMenu implements SciMenu {

  public readonly menuItems = new Array<MMenuItem | MSubMenuItem>();

  public addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => void): this {
    this.menuItems.push({
      type: 'menu-item',
      text: menuItemDescriptor.text,
      tooltip: menuItemDescriptor.tooltip,
      mnemonic: menuItemDescriptor.mnemonic,
      accelerator: menuItemDescriptor.accelerator,
      disabled: menuItemDescriptor.disabled,
      icon: 'icon' in menuItemDescriptor ? menuItemDescriptor.icon : undefined,
      checked: 'checked' in menuItemDescriptor ? menuItemDescriptor.checked : undefined,
      onSelect,
    });
    return this;
  }

  public addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this {
    const subMenu = menuFactoryFn(new ɵSciMenu()) as ɵSciMenu;

    this.menuItems.push({
      type: 'sub-menu-item',
      id: menuDescriptor.id ?? UUID.randomUUID(),
      text: menuDescriptor.text,
      icon: 'icon' in menuDescriptor ? menuDescriptor.icon : undefined,
      tooltip: menuDescriptor.tooltip,
      mnemonic: menuDescriptor.mnemonic,
      disabled: menuDescriptor.disabled,
      children: subMenu.menuItems,
    });
    return this;
  }

  public addGroup(menuFactoryFn: (group: SciMenu) => SciMenu): this;
  public addGroup(menuGroupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenu) => SciMenu): this;
  public addGroup(argument1: unknown, argument2?: unknown): this {
    return this;
  }
}

export interface MMenuItem {
  type: 'menu-item'
  text: string;
  icon?: string;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: () => Signal<boolean> | boolean;
  checked?: () => Signal<boolean> | boolean;
  onSelect: () => void;
}

export interface MSubMenuItem {
  type: 'sub-menu-item'
  id: string;
  text: string;
  icon?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: () => Signal<boolean> | boolean;
  children: Array<MMenuItem | MSubMenuItem>;
}
