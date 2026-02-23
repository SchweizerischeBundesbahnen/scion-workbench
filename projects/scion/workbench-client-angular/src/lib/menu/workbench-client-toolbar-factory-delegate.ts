/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeObservable, Translatable, WorkbenchMenuFactory, WorkbenchToolbarFactory} from '@scion/workbench-client';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenuFactory, SciToolbarControlDescriptor, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarItemDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {toLazyObservable} from '../common/lazy-observable.util';
import {MaybeSignal, RequireOne, SciComponentDescriptor} from '@scion/sci-components/common';

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
  public addToolbarItem(descriptor: SciToolbarControlDescriptor): this;
  public addToolbarItem(iconOrDescriptor: MaybeSignal<string> | SciToolbarItemDescriptor | SciToolbarControlDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this._delegate.addToolbarItem({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(coerceIcon(descriptor.icon)),
      checked: toLazyObservable(descriptor.checked),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: MaybeSignal<string> | SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);
    const filter = coerceFilterDescriptor(descriptor);

    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(coerceLabel(descriptor.icon)),
      tooltip: toLazyObservable(descriptor.tooltip),
      disabled: toLazyObservable(descriptor.disabled),
      visualMenuHint: descriptor.visualMenuHint,
      width: descriptor.width,
      minWidth: descriptor.minWidth,
      maxWidth: descriptor.maxWidth,
      maxHeight: descriptor.maxHeight,
      filter: filter && {
        placeholder: toLazyObservable(filter.placeholder),
        notFoundText: toLazyObservable(filter.notFoundText),
        focus: filter.focus,
      } as RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>; focus?: boolean}> | undefined,
      cssClass: descriptor.cssClass,
    }, (menu: WorkbenchMenuFactory): void => {
      menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu));
    });

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciToolbarFactory) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciToolbarFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    this._delegate.addGroup({
      name: descriptor.name,
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
    }, (group: WorkbenchToolbarFactory): void => {
      groupFactoryFn?.(new WorkbenchClientToolbarFactoryDelegate(group));
    });

    return this;
  }
}

function coerceToolbarItemDescriptor(iconOrDescriptor: MaybeSignal<string> | SciToolbarItemDescriptor | SciToolbarControlDescriptor, onSelect?: () => void): SciToolbarItemDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor, onSelect: onSelect!};
  }
  if ('control' in iconOrDescriptor) {
    throw Error('[MenuDefinitionError] Control not supported in microfrontend toolbar.');
  }
  return iconOrDescriptor;
}

function coerceMenuDescriptor(iconOrDescriptor: MaybeSignal<string> | SciToolbarMenuDescriptor): SciToolbarMenuDescriptor {
  if (typeof iconOrDescriptor === 'string' || isSignal(iconOrDescriptor)) {
    return {icon: iconOrDescriptor};
  }
  return iconOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciToolbarFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarFactory) => void): [SciToolbarGroupDescriptor, ((group: SciToolbarFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceLabel(label: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (!label) {
    return undefined;
  }
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }

  throw Error('[MenuDefinitionError] Component not supported as label in microfrontend menu.');
}

function coerceIcon(icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor): MaybeSignal<string> {
  if (typeof icon === 'string' || isSignal(icon)) {
    return icon;
  }

  throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
}

function coerceFilterDescriptor(menuDescriptor: SciToolbarMenuDescriptor): {placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean} | undefined {
  const filter = menuDescriptor.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
      focus: filter.focus,
    };
  }
  return filter === true ? {} : undefined;
}
