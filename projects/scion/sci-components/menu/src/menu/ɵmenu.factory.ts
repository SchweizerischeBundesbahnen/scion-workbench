import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuGroupFactory, SciMenuItemDescriptor} from './menu.factory';
import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciToolbarFactory} from '../toolbar/ɵtoolbar.factory';
import {ComponentType} from '@angular/cdk/portal';
import {coerceSignal, MaybeSignal} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {translate} from '../menu-translate.util';
import {SciToolbarMenuDescriptor} from '@scion/sci-components/menu';

/**
 * Translation note: Texts are translated when added (not lazily when rendered) to simplify filtering.
 */
export class ɵSciMenuFactory implements SciMenuFactory {

  public readonly menuItems = [] as SciMenuItemLike[];

  /** @inheritDoc */
  public addMenuItem(label: MaybeSignal<Translatable>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeSignal<Translatable> | SciMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵSciToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Construct menu item.
    this.menuItems.push({
      type: 'menu-item',
      name: descriptor.name,
      labelText: translate(coerceLabelText(descriptor.label)),
      labelComponent: coerceLabelComponent(descriptor.label),
      icon: coerceSignal(descriptor.icon),
      checked: coerceSignal(descriptor.checked),
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled),
      actions: actionsFactory.menuItems,
      matchesFilter: descriptor.onFilter,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: async () => await descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
    } satisfies SciMenuItem);

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeSignal<Translatable> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵSciMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push({
      type: 'menu',
      name: descriptor.name,
      labelText: translate(coerceLabelText(descriptor.label)),
      labelComponent: coerceLabelComponent(descriptor.label),
      icon: coerceSignal(descriptor.icon),
      tooltip: translate(descriptor.tooltip),
      disabled: coerceSignal(descriptor.disabled),
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: coerceFilterDescriptor(descriptor),
      },
      children: menuFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
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
      label: translate(descriptor.label),
      collapsible: coerceCollapsibleDescriptor(descriptor),
      disabled: coerceSignal(descriptor.disabled),
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    } satisfies SciMenuGroup);

    return this;
  }
}

function coerceMenuItemDescriptor(labelOrDescriptor: MaybeSignal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): SciMenuItemDescriptor {
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

function coerceLabelText(label: MaybeSignal<Translatable> | ComponentType<unknown>): MaybeSignal<Translatable> | undefined {
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }
  return undefined;
}

function coerceLabelComponent(label: MaybeSignal<Translatable> | ComponentType<unknown>): ComponentType<unknown> | undefined {
  if (typeof label === 'function' && !isSignal(label)) {
    return label;
  }
  return undefined;
}

function coerceFilterDescriptor(menuDescriptor: SciToolbarMenuDescriptor): {placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>} | undefined {
  const filter = menuDescriptor.menu?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: coerceSignal(filter.placeholder),
      notFoundText: coerceSignal(filter.notFoundText),
    };
  }
  return filter === true ? {} : undefined;
}

function coerceCollapsibleDescriptor(groupDescriptor: SciMenuGroupDescriptor): {collapsed: boolean} | undefined {
  const collapsible = groupDescriptor.collapsible;

  if (typeof collapsible === 'object') {
    return collapsible;
  }

  return collapsible === true ? {collapsed: false} : undefined;
}
