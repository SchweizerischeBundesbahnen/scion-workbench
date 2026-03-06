import {SciMenu, SciMenuDescriptor, SciMenuGroup, SciMenuGroupDescriptor, SciMenuItemDescriptor} from './menu.model';
import {isSignal, Signal, signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {Arrays} from '@scion/toolkit/util';
import {SciMenuContribution, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {coerceSignal} from '../common/common';
import {coerceArray} from '@angular/cdk/coercion';

export class ɵSciMenu implements SciMenu {

  public readonly contributions = new Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>();
  public readonly groupContributions = new Array<MenuGroupContributionDescriptor>();
  public readonly menuContributions = new Array<MenuContributionDescriptor>();

  /** @inheritDoc */
  public addMenuItem(label: string | Signal<string>, onSelect: (context: Map<string, unknown>) => boolean | void): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(argument1: string | Signal<string> | SciMenuItemDescriptor, argument2?: (context: Map<string, unknown>) => boolean | void): this {
    if (typeof argument1 === 'string' || isSignal(argument1)) {
      return this.addMenuItemFromDescriptor({label: argument1, onSelect: argument2!});
    }
    else {
      return this.addMenuItemFromDescriptor(argument1);
    }
  }

  private addMenuItemFromDescriptor(descriptor: SciMenuItemDescriptor): this {
    this.contributions.push({
      type: 'menu-item',
      name: coerceArray(descriptor.name ?? []),
      label: coerceSignal(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      checked: 'checked' in descriptor ? coerceSignal(descriptor.checked) : undefined,
      tooltip: coerceSignal(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      actionToolbarName: coerceSignal(descriptor.actionToolbarName),
      matchesFilter: descriptor.onFilter,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: (context) => descriptor.onSelect(context) ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
      data: descriptor.data,
    } satisfies SciMenuItemContribution);

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this {
    const id = UUID.randomUUID();
    const menuItem: SciMenuContribution = {
      type: 'menu',
      name: coerceArray(descriptor.name ?? []).concat(`menu:${id}`),
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
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    };

    this.contributions.push(menuItem);

    // children
    this.menuContributions.push({
      location: `menu:${id}`,
      factoryFn: menuFactoryFn,
    });

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciMenuGroup) => void): this;
  public addGroup(groupDescriptor: SciMenuGroupDescriptor, menuFactoryFn?: (group: SciMenuGroup) => void): this;
  public addGroup(argument1: unknown, argument2?: unknown): this {
    const id = UUID.randomUUID();

    if (typeof argument1 === 'function') {
      const groupFactoryFn = argument1 as (group: SciMenuGroup) => SciMenuGroup;

      this.contributions.push({
        type: 'group',
        name: [`group:${id}`],
        collapsible: false,
        disabled: signal(false),
      });

      // children
      this.groupContributions.push({
        location: `group(menu):${id}`,
        factoryFn: groupFactoryFn,
      });

      return this;
    }
    else {
      const descriptor = argument1 as SciMenuGroupDescriptor;
      const groupFactoryFn = argument2 as ((group: SciMenuGroup) => SciMenuGroup) | undefined;

      this.contributions.push({
        type: 'group',
        name: coerceArray(descriptor.name ?? []).concat(`group:${id}`),
        label: coerceSignal(descriptor.label),
        collapsible: computeCollapsible(descriptor),
        disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
        cssClass: Arrays.coerce(descriptor.cssClass),
        data: descriptor.data,
      });

      // children
      if (groupFactoryFn) {
        this.groupContributions.push({
          location: `group(menu):${id}`,
          factoryFn: groupFactoryFn,
        });
      }

      return this;
    }
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

export interface MenuContributionDescriptor {
  location: `menu:${string}`;
  factoryFn: (group: SciMenu) => void;
}

export interface MenuGroupContributionDescriptor {
  location: `group(menu):${string}`;
  factoryFn: (group: SciMenuGroup) => void;
}
