import {SciMenuFactory} from '../menu/menu.factory';
import {inject, Injector, isSignal, runInInjectionContext, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarGroupFactory, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from './toolbar.factory';
import {coerceSignal} from '../common/common';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuFactory} from '../menu/ɵmenu.factory';
import {OneOf} from '../common/utility-types';
import {ComponentType} from '@angular/cdk/portal';

export class ɵSciToolbarFactory implements SciToolbarFactory {

  public readonly menuItems = [] as SciMenuItemLike[];

  /** @inheritDoc */
  public addToolbarItem(icon: string | Signal<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: SciToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: string | Signal<string> | SciToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this.menuItems.push({
      type: 'menu-item',
      name: descriptor.name,
      label: coerceLabel(descriptor.label),
      icon: coerceSignal('icon' in descriptor ? descriptor.icon : undefined),
      checked: 'checked' in descriptor ? coerceSignal(descriptor.checked) : undefined,
      tooltip: coerceSignal(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      actions: [],
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: () => {
        descriptor.onSelect();
        return false;
      },
      data: descriptor.data,
    } satisfies SciMenuItem);

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: string | Signal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: string | Signal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

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
      visualMenuHint: descriptor.visualMenuHint ?? true,
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
      disabled: coerceSignal(descriptor.disabled, {defaultValue: false}),
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      data: descriptor.data,
    } satisfies SciMenuGroup);

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

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciToolbarGroupFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroupFactory) => void): [SciToolbarGroupDescriptor, ((group: SciToolbarGroupFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceLabel(label: string | Signal<string> | ComponentType<unknown> | undefined): OneOf<{text?: Signal<string>; component?: ComponentType<unknown>}> | undefined {
  if (!label) {
    return undefined;
  }
  if (typeof label === 'string' || isSignal(label)) {
    return {text: coerceSignal(label)};
  }
  return {component: label};
}

export function ɵcreateSciToolbar(toolbarFactoryFn: (menu: SciToolbarFactory | SciToolbarGroupFactory, context: Map<string, unknown>) => void, context: Map<string, unknown>, options?: {injector?: Injector}): SciMenuItemLike[] {
  const injector = options?.injector ?? inject(Injector);
  const toolbarFactory = new ɵSciToolbarFactory();
  runInInjectionContext(injector, () => toolbarFactoryFn(toolbarFactory, context));
  return toolbarFactory.menuItems;
}
