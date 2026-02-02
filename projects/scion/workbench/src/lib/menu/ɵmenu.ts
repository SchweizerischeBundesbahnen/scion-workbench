import {SciCheckableMenuItemDescriptor, SciIconMenuItemDescriptor, SciMenu, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/workbench';
import {Signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';

export class ɵSciMenu implements SciMenu {

  public readonly menuItems = new Array<MMenuItem | MSubMenuItem | MMenuGroup>();

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

  public addGroup(groupFactoryFn: (group: SciMenu) => SciMenu): this;
  public addGroup(groupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenu) => SciMenu): this;
  public addGroup(argument1: unknown, argument2?: unknown): this {
    if (typeof argument1 === 'function') {
      const subMenu = argument1(new ɵSciMenu()) as ɵSciMenu;

      this.menuItems.push({
        type: 'group',
        id: UUID.randomUUID(),
        children: subMenu.menuItems,
      });
      return this;
    }
    else {
      const groupDescriptor = argument1 as SciMenuGroupDescriptor;
      const groupFactoryFn = argument2 as (group: SciMenu) => SciMenu;
      const subMenu = groupFactoryFn(new ɵSciMenu()) as ɵSciMenu;

      this.menuItems.push({
        type: 'group',
        id: groupDescriptor.id ?? UUID.randomUUID(),
        label: groupDescriptor.label,
        collapsible: groupDescriptor.collapsible,
        disabled: groupDescriptor.disabled,
        children: subMenu.menuItems,
      });
      return this;
    }
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
  children: Array<MMenuItem | MSubMenuItem | MMenuGroup>;
}

export interface MMenuGroup {
  type: 'group'
  id: string;
  label?: string;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: () => Signal<boolean> | boolean;
  children: Array<MMenuItem | MSubMenuItem | MMenuGroup>;
}
