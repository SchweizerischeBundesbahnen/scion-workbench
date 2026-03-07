import {SciMenu} from '../menu/menu.model';
import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciToolbar, SciToolbarGroup, SciToolbarGroupDescriptor, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from './toolbar.model';
import {coerceSignal} from '../common/common';
import {SciMenuContribution, SciMenuContributions, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {coerceArray} from '@angular/cdk/coercion';
import {ɵSciMenu} from '../menu/ɵmenu.model';

export class ɵSciToolbar implements SciToolbar {

  public readonly contributions = [] as SciMenuContributions;

  /** @inheritDoc */
  public addToolbarItem(icon: string | Signal<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: SciToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: string | Signal<string> | SciToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this.contributions.push({
      type: 'menu-item',
      name: coerceArray(descriptor.name ?? []),
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      checked: 'checked' in descriptor ? coerceSignal(descriptor.checked) : undefined,
      tooltip: coerceSignal(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: () => {
        descriptor.onSelect();
        return false;
      },
      data: descriptor.data,
    } satisfies SciMenuItemContribution);

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: string | Signal<string>, menuFactoryFn: (menu: SciMenu) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this;
  public addMenu(iconOrDescriptor: string | Signal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

    // Construct menu.
    const menu = new ɵSciMenu();
    menuFactoryFn(menu);

    // Add menu.
    this.contributions.push({
      type: 'menu',
      name: coerceArray(descriptor.name ?? []),
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      tooltip: coerceSignal(descriptor.tooltip),
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      visualMenuHint: descriptor.visualMenuHint ?? true,
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
  public addGroup(groupFactoryFn: (group: SciToolbarGroup) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroup) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciToolbarGroup) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroup) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const group = new ɵSciToolbar();
    groupFactoryFn?.(group);

    // Add group.
    this.contributions.push({
      type: 'group',
      name: coerceArray(descriptor.name ?? []),
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      children: group.contributions,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenuGroupContribution);

    return this;
  }
}

function coerceToolbarItemDescriptor(iconOrDescriptor: string | Signal<string> | SciToolbarItemDescriptor, onSelect?: () => void): SciToolbarItemDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor, onSelect: onSelect!};
  }
  return iconOrDescriptor;
}

function coerceMenuDescriptor(iconOrDescriptor: string | Signal<string> | SciToolbarMenuDescriptor): SciToolbarMenuDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor};
  }
  return iconOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciToolbarGroup) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroup) => void): [SciToolbarGroupDescriptor, ((group: SciToolbarGroup) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
