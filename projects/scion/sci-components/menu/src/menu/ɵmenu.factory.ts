import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuGroupFactory, SciMenuItemDescriptor} from './menu.factory';
import {inject, Injector, isSignal, runInInjectionContext, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {coerceSignal} from '../common/common';
import {ɵSciToolbarFactory} from '../toolbar/ɵtoolbar.factory';
import {ComponentType} from '@angular/cdk/portal';
import {MaybeSignal, OneOf} from '../common/utility-types';

export class ɵSciMenuFactory implements SciMenuFactory {

  public readonly menuItems = [] as SciMenuItemLike[];

  /** @inheritDoc */
  public addMenuItem(label: MaybeSignal<string>, onSelect: () => boolean | void): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeSignal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵSciToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Construct menu item.
    this.menuItems.push({
      type: 'menu-item',
      name: descriptor.name,
      label: coerceLabel(descriptor.label),
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
  public addMenu(label: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeSignal<string> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵSciMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push({
      type: 'menu',
      name: descriptor.name,
      label: coerceLabel(descriptor.label),
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

function coerceMenuItemDescriptor(labelOrDescriptor: MaybeSignal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void): SciMenuItemDescriptor {
  if (typeof labelOrDescriptor === 'string' || isSignal(labelOrDescriptor)) {
    return {label: labelOrDescriptor, onSelect: onSelect!};
  }
  return labelOrDescriptor;
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeSignal<string> | SciMenuDescriptor): SciMenuDescriptor {
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

function coerceLabel(label: MaybeSignal<string> | ComponentType<unknown>): OneOf<{text?: Signal<string>; component?: ComponentType<unknown>}> {
  if (typeof label === 'string' || isSignal(label)) {
    return {text: coerceSignal(label)};
  }
  return {component: label};
}

export function ɵcreateSciMenu(menuFactoryFn: (menu: SciMenuFactory | SciMenuGroupFactory, context: Map<string, unknown>) => void, context: Map<string, unknown>, options?: {injector?: Injector}): SciMenuItemLike[] {
  const injector = options?.injector ?? inject(Injector);
  const menuFactory = new ɵSciMenuFactory();
  runInInjectionContext(injector, () => menuFactoryFn(menuFactory, context));
  return menuFactory.menuItems;
}
