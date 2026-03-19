import {WorkbenchMenuFactory, WorkbenchToolbarFactory, WorkbenchToolbarGroupFactory} from '@scion/workbench-client';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {MaybeSignal} from '../common/utility-types';
import {SciMenuFactory, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarGroupFactory, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {toLazyObservable} from './workbench-client-menu-transform';

/**
 * Represents a {@link SciToolbarFactory} that delegates to {@link WorkbenchToolbarFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientToolbarFactoryDelegate implements SciToolbarFactory {

  private readonly _injector = inject(Injector);

  constructor(private readonly _delegate: WorkbenchToolbarFactory) {
  }

  /** @inheritDoc */
  public addToolbarItem(icon: MaybeSignal<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: SciToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: MaybeSignal<string> | SciToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this._delegate.addToolbarItem({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(descriptor.icon),
      checked: toLazyObservable(descriptor.checked),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: MaybeSignal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(descriptor.icon),
      tooltip: toLazyObservable(descriptor.tooltip),
      disabled: toLazyObservable(descriptor.disabled),
      visualMenuHint: descriptor.visualMenuHint,
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
  public addGroup(groupFactoryFn: (group: SciToolbarGroupFactory) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciToolbarGroupFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    this._delegate.addGroup({
      name: descriptor.name,
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
    }, (group: WorkbenchToolbarGroupFactory): void => {
      const sciToolbarGroup = new WorkbenchClientToolbarFactoryDelegate(group);
      groupFactoryFn?.(sciToolbarGroup);
    });

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

function coerceLabel(label: MaybeSignal<string> | ComponentType<unknown> | undefined): MaybeSignal<string> | undefined {
  if (!label) {
    return undefined;
  }
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }

  throw Error('[MenuDefinitionError] Component not supported as menu label.');
}
