import {SciMenu} from '../menu/menu.model';
import {isSignal, Signal, signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {Arrays} from '@scion/toolkit/util';
import {SciToolbar, SciToolbarGroup, SciToolbarGroupDescriptor, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from './toolbar.model';
import {coerceSignal} from '../common/common';
import {SciMenuContribution, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {coerceArray} from '@angular/cdk/coercion';

export class ɵSciToolbar implements SciToolbar {

  public readonly contributions = new Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>();
  public readonly groupContributions = new Array<ToolbarGroupContributionDescriptor>();
  public readonly menuContributions = new Array<ToolbarMenuContributionDescriptor>();

  /** @inheritDoc */
  public addToolbarItem(icon: string | Signal<string>, onSelect: (context: Map<string, unknown>) => void): this;
  public addToolbarItem(descriptor: SciToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: string | Signal<string> | SciToolbarItemDescriptor, onSelect?: (context: Map<string, unknown>) => void): this {
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
      onSelect: context => {
        descriptor.onSelect(context);
        return false;
      },
      data: descriptor.data,
    } satisfies SciMenuItemContribution);

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: string | Signal<string>, menuFactoryFn: (menu: SciMenu) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this;
  public addMenu(iconOrDescriptor: string | Signal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenu) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

    const id = UUID.randomUUID();
    const menuItem: SciMenuContribution = {
      type: 'menu',
      name: coerceArray(descriptor.name ?? []).concat(`menu:${id}`),
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
  public addGroup(groupFactoryFn: (group: SciToolbarGroup) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroup) => void): this;
  public addGroup(argument1: unknown, argument2?: unknown): this {
    const id = UUID.randomUUID();

    if (typeof argument1 === 'function') {
      const groupFactoryFn = argument1 as (group: SciToolbarGroup) => void;

      this.contributions.push({
        type: 'group',
        name: [`group:${id}`],
        disabled: signal(false),
      } satisfies SciMenuGroupContribution);

      // children
      this.groupContributions.push({
        location: `group(toolbar):${id}`,
        factoryFn: groupFactoryFn,
      });

      return this;
    }
    else {
      const descriptor = argument1 as SciToolbarGroupDescriptor;
      const groupFactoryFn = argument2 as ((group: SciToolbarGroup) => void) | undefined;

      this.contributions.push({
        type: 'group',
        name: coerceArray(descriptor.name ?? []).concat(`group:${id}`),
        disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
        cssClass: Arrays.coerce(descriptor.cssClass),
        data: descriptor.data,
      } satisfies SciMenuGroupContribution);

      // children
      if (groupFactoryFn) {
        this.groupContributions.push({
          location: `group(toolbar):${id}`,
          factoryFn: groupFactoryFn,
        });
      }

      return this;
    }
  }
}

export interface ToolbarMenuContributionDescriptor {
  location: `menu:${string}`;
  factoryFn: (group: SciMenu) => void;
}

export interface ToolbarGroupContributionDescriptor {
  location: `group(toolbar):${string}`;
  factoryFn: (group: SciToolbarGroup) => void;
}

function coerceToolbarItemDescriptor(iconOrDescriptor: string | Signal<string> | SciToolbarItemDescriptor, onSelect?: (context: Map<string, unknown>) => void): SciToolbarItemDescriptor {
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
