import {SciMenuFactory} from '../menu/menu.factory';
import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarGroupFactory, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from './toolbar.factory';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuFactory} from '../menu/ɵmenu.factory';
import {coerceSignal, MaybeSignal, SciComponentDescriptor} from '@scion/sci-components/common';
import {ComponentType} from '@angular/cdk/portal';
import {Translatable} from '@scion/sci-components/text';
import {translate} from '../menu-translate.util';

/**
 * Translation note: Texts are translated when added (not lazily when rendered) to simplify filtering.
 */
export class ɵSciToolbarFactory implements SciToolbarFactory {

  public readonly menuItems = [] as SciMenuItemLike[];

  /** @inheritDoc */
  public addToolbarItem(icon: MaybeSignal<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: SciToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: MaybeSignal<string> | SciToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this.menuItems.push({
      type: 'menu-item',
      name: descriptor.name,
      labelText: translate(coerceLabelText(descriptor.label)),
      labelComponent: coerceLabelComponent(descriptor.label),
      iconLigature: coerceSignal(coerceIconLigature(descriptor.icon)),
      iconComponent: coerceIconComponent(descriptor.icon),
      checked: coerceSignal(descriptor.checked),
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled),
      actions: [],
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: async () => {
        descriptor.onSelect();
        return false;
      },
    } satisfies SciMenuItem);

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: MaybeSignal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵSciMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push({
      type: 'menu',
      name: descriptor.name,
      labelText: translate(coerceLabelText(descriptor.label)),
      labelComponent: coerceLabelComponent(descriptor.label),
      iconLigature: coerceSignal(coerceIconLigature(descriptor.icon)),
      iconComponent: coerceIconComponent(descriptor.icon),
      tooltip: translate(descriptor.tooltip),
      disabled: coerceSignal(descriptor.disabled),
      visualMenuHint: descriptor.visualMenuHint ?? true,
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
  public addGroup(groupFactoryFn: (group: SciToolbarGroupFactory) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciToolbarGroupFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const groupFactory = new ɵSciToolbarFactory();
    groupFactoryFn?.(groupFactory);

    // Add group.
    this.menuItems.push({
      type: 'group',
      name: descriptor.name,
      disabled: coerceSignal(descriptor.disabled),
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    } satisfies SciMenuGroup);

    return this;
  }
}

function coerceToolbarItemDescriptor(iconOrDescriptor: MaybeSignal<string> | SciToolbarItemDescriptor, onSelect?: () => void): SciToolbarItemDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor, onSelect: onSelect!};
  }
  return iconOrDescriptor;
}

function coerceMenuDescriptor(iconOrDescriptor: MaybeSignal<string> | SciToolbarMenuDescriptor): SciToolbarMenuDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor};
  }
  return iconOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciToolbarGroupFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroupFactory) => void): [SciToolbarGroupDescriptor, ((group: SciToolbarGroupFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceLabelText(label: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<Translatable> | undefined {
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }
  return undefined;
}

function coerceLabelComponent(label: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor | undefined): SciComponentDescriptor | undefined {
  if (typeof label === 'function' && !isSignal(label)) {
    return {component: label};
  }
  else if (typeof label === 'object') {
    return label;
  }
  return undefined;
}

function coerceIconLigature(icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (typeof icon === 'string' || isSignal(icon)) {
    return icon;
  }
  return undefined;
}

function coerceIconComponent(icon: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor | undefined): SciComponentDescriptor | undefined {
  if (typeof icon === 'function' && !isSignal(icon)) {
    return {component: icon};
  }
  else if (typeof icon === 'object') {
    return icon;
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
