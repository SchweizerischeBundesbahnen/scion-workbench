import {SciMenu, SciMenuDescriptor, SciMenuGroup, SciMenuGroupDescriptor, SciMenuItemDescriptor} from './menu.model';
import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciMenuContribution, SciMenuContributions, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {coerceSignal} from '../common/common';

export class ɵSciMenu implements SciMenu {

  public readonly contributions = [] as SciMenuContributions;

  /** @inheritDoc */
  public addMenuItem(label: string | Signal<string>, onSelect: () => boolean | void): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: string | Signal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    this.contributions.push({
      type: 'menu-item',
      name: descriptor.name,
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      checked: 'checked' in descriptor ? coerceSignal(descriptor.checked) : undefined,
      tooltip: coerceSignal(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      actionToolbarName: coerceSignal(descriptor.actionToolbarName),
      matchesFilter: descriptor.onFilter,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: () => descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
      data: descriptor.data,
    } satisfies SciMenuItemContribution);

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: string | Signal<string>, menuFactoryFn: (menu: SciMenu) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this ;
  public addMenu(labelOrDescriptor: string | Signal<string> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menu = new ɵSciMenu();
    menuFactoryFn(menu);

    // Add menu.
    this.contributions.push({
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
      children: menu.contributions,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenuContribution);

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciMenuGroup) => void): this;
  public addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuGroup) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciMenuGroup) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuGroup) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const group = new ɵSciMenu();
    groupFactoryFn?.(group);

    // Add group.
    this.contributions.push({
      type: 'group',
      name: descriptor.name,
      label: coerceSignal(descriptor.label),
      collapsible: computeCollapsible(descriptor),
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      children: group.contributions,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenuGroupContribution);

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

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciMenuGroup) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuGroup) => void): [SciMenuGroupDescriptor, ((group: SciMenuGroup) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
