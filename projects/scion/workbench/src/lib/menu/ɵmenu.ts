import {SciCheckableMenuItemDescriptor, SciIconMenuItemDescriptor, SciMenu, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/workbench';
import {isSignal, signal, Signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';

export class ɵSciMenu implements SciMenu {

  public readonly menuItems = new Array<MMenuItem | MSubMenuItem | MMenuGroup>();

  public addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => void): this {
    this.menuItems.push({
      type: 'menu-item',
      label: menuItemDescriptor.label,
      tooltip: menuItemDescriptor.tooltip,
      mnemonic: menuItemDescriptor.mnemonic,
      accelerator: menuItemDescriptor.accelerator,
      disabled: coerceSignal(menuItemDescriptor.disabled),
      icon: 'icon' in menuItemDescriptor ? menuItemDescriptor.icon : undefined,
      checked: 'checked' in menuItemDescriptor ? coerceSignal(menuItemDescriptor.checked) : undefined,
      onSelect,
    });
    return this;
  }

  public addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this {
    const subMenu = menuFactoryFn(new ɵSciMenu()) as ɵSciMenu;

    this.menuItems.push({
      type: 'sub-menu-item',
      id: menuDescriptor.id ?? UUID.randomUUID(),
      label: menuDescriptor.label,
      icon: 'icon' in menuDescriptor ? menuDescriptor.icon : undefined,
      tooltip: menuDescriptor.tooltip,
      mnemonic: menuDescriptor.mnemonic,
      disabled: coerceSignal(menuDescriptor.disabled),
      filter: menuDescriptor.filter,
      visualMenuMarker: menuDescriptor.visualMenuMarker,
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
        filter: groupDescriptor.filter,
        disabled: coerceSignal(groupDescriptor.disabled),
        children: subMenu.menuItems,
      });
      return this;
    }
  }
}

export interface MMenuItem {
  type: 'menu-item'
  label?: string;
  icon?: string;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: Signal<boolean>;
  checked?: Signal<boolean>;
  onSelect: () => void;
}

export interface MSubMenuItem {
  type: 'sub-menu-item'
  id: string;
  label?: string;
  icon?: string;
  tooltip?: string;
  mnemonic?: string;
  disabled?: Signal<boolean>;
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  visualMenuMarker?: boolean;
  children: Array<MMenuItem | MSubMenuItem | MMenuGroup>;
}

export interface MMenuGroup {
  type: 'group'
  id: string;
  label?: string;
  collapsible?: boolean | {collapsed: boolean};
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  disabled?: Signal<boolean>;
  children: Array<MMenuItem | MSubMenuItem | MMenuGroup>;
}

function coerceSignal<T>(value: Signal<T> | T | undefined): Signal<T> | undefined {
  if (value === undefined) {
    return undefined;
  }
  return isSignal(value) ? value : signal(value);
}
