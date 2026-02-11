import {SciCheckableMenuItemDescriptor, SciIconMenuItemDescriptor, SciMenu, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/workbench';
import {isSignal, signal, Signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {ComponentType} from '@angular/cdk/portal';
import {Arrays} from '@scion/toolkit/util';

export class ɵSciMenu implements SciMenu {

  public readonly menuItems = new Array<MMenuItem | MSubMenuItem | MMenuGroup>();

  public addMenuItem(menuItemDescriptor: SciMenuItemDescriptor | SciIconMenuItemDescriptor | SciCheckableMenuItemDescriptor, onSelect: () => boolean | void): this {
    this.menuItems.push({
      type: 'menu-item',
      id: menuItemDescriptor.id ?? UUID.randomUUID(),
      label: coerceSignal(menuItemDescriptor.label),
      tooltip: menuItemDescriptor.tooltip,
      mnemonic: menuItemDescriptor.mnemonic,
      accelerator: menuItemDescriptor.accelerator,
      disabled: coerceSignal(menuItemDescriptor.disabled),
      icon: coerceSignal('icon' in menuItemDescriptor ? menuItemDescriptor.icon : undefined),
      checked: 'checked' in menuItemDescriptor ? coerceSignal(menuItemDescriptor.checked) : undefined,
      actionToolbarName: coerceSignal(menuItemDescriptor.actionToolbarName),
      matchesFilter: menuItemDescriptor.matchesFilter,
      cssClass: Arrays.coerce(menuItemDescriptor.cssClass),
      onSelect,
    } satisfies MMenuItem);
    return this;
  }

  public addMenu(menuDescriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this {
    const subMenu = menuFactoryFn(new ɵSciMenu()) as ɵSciMenu;

    this.menuItems.push({
      type: 'sub-menu-item',
      id: menuDescriptor.id ?? UUID.randomUUID(),
      label: coerceSignal(menuDescriptor.label),
      icon: coerceSignal('icon' in menuDescriptor ? menuDescriptor.icon : undefined),
      tooltip: menuDescriptor.tooltip,
      mnemonic: menuDescriptor.mnemonic,
      disabled: coerceSignal(menuDescriptor.disabled),
      filter: menuDescriptor.filter,
      visualMenuMarker: menuDescriptor.visualMenuMarker,
      size: menuDescriptor.size,
      cssClass: Arrays.coerce(menuDescriptor.cssClass),
      children: subMenu.menuItems,
    } satisfies MSubMenuItem);
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
      } satisfies MMenuGroup);
      return this;
    }
    else {
      const groupDescriptor = argument1 as SciMenuGroupDescriptor;
      const groupFactoryFn = argument2 as ((group: SciMenu) => SciMenu) | undefined;
      const subMenu = groupFactoryFn?.(new ɵSciMenu()) as ɵSciMenu | undefined;

      this.menuItems.push({
        type: 'group',
        id: groupDescriptor.id ?? UUID.randomUUID(),
        label: coerceSignal(groupDescriptor.label),
        collapsible: typeof groupDescriptor.collapsible === 'object' ? groupDescriptor.collapsible : {collapsed: groupDescriptor.collapsible ?? false},
        filter: groupDescriptor.filter,
        disabled: coerceSignal(groupDescriptor.disabled),
        children: subMenu?.menuItems ?? [],
      } satisfies MMenuGroup);
      return this;
    }
  }
}

export interface MMenuItem {
  type: 'menu-item'
  id: string;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: string;
  mnemonic?: string;
  accelerator?: string[];
  disabled?: Signal<boolean>;
  checked?: Signal<boolean>;
  actionToolbarName?: Signal<string | undefined>;
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  onSelect: () => boolean | void;
}

export interface MSubMenuItem {
  type: 'sub-menu-item'
  id: string;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: string;
  mnemonic?: string;
  disabled?: Signal<boolean>;
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  visualMenuMarker?: boolean;
  size?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
  };
  cssClass?: string[];
  children: Array<MMenuItem | MSubMenuItem | MMenuGroup>;
}

export interface MMenuGroup {
  type: 'group'
  id: string;
  label?: Signal<string>;
  collapsible?: {collapsed: boolean};
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
