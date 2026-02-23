import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuGroupFactory, SciMenuItemDescriptor} from './menu.factory';
import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {coerceSignal} from '../common/common';
import {ɵSciToolbarFactory} from '../toolbar/ɵtoolbar.factory';

export class ɵSciMenuFactory implements SciMenuFactory {

  public readonly menuItems = [] as SciMenuItemLike[];

  /** @inheritDoc */
  public addMenuItem(label: string | Signal<string>, onSelect: () => boolean | void): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: string | Signal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵSciToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Construct menu item.
    this.menuItems.push({
      type: 'menu-item',
      name: descriptor.name,
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      checked: 'checked' in descriptor ? coerceSignal(descriptor.checked) : undefined,
      tooltip: coerceSignal(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      actions: actionsFactory.menuItems,
      matchesFilter: descriptor.onFilter,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: () => descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
      data: descriptor.data,
    } satisfies SciMenuItem);

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: string | Signal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: string | Signal<string> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵSciMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push({
      type: 'menu',
      name: descriptor.name,
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      tooltip: coerceSignal(descriptor.tooltip),
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        filter: descriptor.menu?.filter,
      },
      children: menuFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenu);

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciMenuGroupFactory) => void): this;
  public addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciMenuGroupFactory) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const groupFactory = new ɵSciMenuFactory();
    groupFactoryFn?.(groupFactory);

    // Add group.
    this.menuItems.push({
      type: 'group',
      name: descriptor.name,
      label: coerceSignal(descriptor.label),
      collapsible: computeCollapsible(descriptor),
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenuGroup);

    return this;
  }
}

function computeCollapsible(groupDescriptor: SciMenuGroupDescriptor): {collapsed: boolean} | false {
  const collapsible = groupDescriptor.collapsible ?? false;
  if (!collapsible) {
    return false;
  }

  if (typeof groupDescriptor.collapsible === 'object') {
    return groupDescriptor.collapsible;
  }

  return {collapsed: false};
}

function coerceMenuItemDescriptor(labelOrDescriptor: string | Signal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void): SciMenuItemDescriptor {
  if (typeof labelOrDescriptor === 'string' || isSignal(labelOrDescriptor)) {
    return {label: labelOrDescriptor, onSelect: onSelect!};
  }
  return labelOrDescriptor;
}

function coerceMenuDescriptor(labelOrDescriptor: string | Signal<string> | SciMenuDescriptor): SciMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isSignal(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciMenuGroupFactory) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuGroupFactory) => void): [SciMenuGroupDescriptor, ((group: SciMenuGroupFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
