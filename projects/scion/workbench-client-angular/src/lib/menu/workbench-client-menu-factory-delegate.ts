import {WorkbenchMenuFactory, WorkbenchMenuGroupFactory, WorkbenchToolbarFactory} from '@scion/workbench-client';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {MaybeSignal} from '../common/utility-types';
import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuGroupFactory, SciMenuItemDescriptor} from '@scion/sci-components/menu';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {toLazyObservable} from './workbench-client-menu-transform';

/**
 * Represents a {@link SciMenuFactory} that delegates to {@link WorkbenchMenuFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientMenuFactoryDelegate implements SciMenuFactory {

  private readonly _injector = inject(Injector);

  constructor(private readonly _delegate: WorkbenchMenuFactory) {
  }

  /** @inheritDoc */
  public addMenuItem(label: MaybeSignal<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeSignal<string> | SciMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    this._delegate.addMenuItem({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(descriptor.icon),
      checked: toLazyObservable(descriptor.checked),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      actions: (actions: WorkbenchToolbarFactory): void => {
        const sciToolbar = new WorkbenchClientToolbarFactoryDelegate(actions);
        descriptor.actions?.(sciToolbar);
      },
      onFilter: descriptor.onFilter,
      cssClass: descriptor.cssClass,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeSignal<string> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(descriptor.icon),
      tooltip: toLazyObservable(descriptor.tooltip),
      disabled: toLazyObservable(descriptor.disabled),
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: descriptor.menu?.filter,
      },
      cssClass: descriptor.cssClass,
    }, (menu: WorkbenchMenuFactory): void => {
      const sciMenu = new WorkbenchClientMenuFactoryDelegate(menu);
      menuFactoryFn(sciMenu);
    });

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciMenuGroupFactory) => void): this;
  public addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciMenuGroupFactory) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    this._delegate.addGroup({
      name: descriptor.name,
      label: toLazyObservable(descriptor.label),
      collapsible: coerceCollapsible(descriptor),
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
    }, (group: WorkbenchMenuGroupFactory): void => {
      const sciMenuGroup = new WorkbenchClientMenuFactoryDelegate(group);
      groupFactoryFn?.(sciMenuGroup);
    });

    return this;
  }
}

function coerceCollapsible(groupDescriptor: SciMenuGroupDescriptor): {collapsed: boolean} | false {
  const collapsible = groupDescriptor.collapsible ?? false;
  if (!collapsible) {
    return false;
  }

  if (typeof groupDescriptor.collapsible === 'object') {
    return groupDescriptor.collapsible;
  }

  return {collapsed: false};
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

function coerceLabel(label: MaybeSignal<string> | ComponentType<unknown>): MaybeSignal<string> {
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }

  throw Error('[MenuDefinitionError] Component not supported as menu label.');
}

