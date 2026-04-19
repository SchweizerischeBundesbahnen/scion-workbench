/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeObservable, WorkbenchMenuFactory, WorkbenchToolbarFactory} from '@scion/workbench-client';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/sci-components/menu';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {toLazyObservable} from '../common/lazy-observable.util';
import {MaybeSignal, RequireOne, SciComponentDescriptor} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

/**
 * Represents a {@link SciMenuFactory} that delegates to {@link WorkbenchMenuFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientMenuFactoryDelegate implements SciMenuFactory {

  private readonly _injector = inject(Injector);

  constructor(private readonly _delegate: WorkbenchMenuFactory) {
  }

  /** @inheritDoc */
  public addMenuItem(label: MaybeSignal<Translatable>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: SciMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeSignal<Translatable> | SciMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    this._delegate.addMenuItem({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(coerceIcon(descriptor.icon)),
      checked: toLazyObservable(descriptor.checked),
      active: toLazyObservable(descriptor.active),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      actions: (actions: WorkbenchToolbarFactory): void => {
        const sciToolbar = new WorkbenchClientToolbarFactoryDelegate(actions);
        descriptor.actions?.(sciToolbar);
      },
      onFilter: descriptor.onFilter,
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeSignal<Translatable> | SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);
    const filter = coerceFilterDescriptor(descriptor);

    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(coerceIcon(descriptor.icon)),
      disabled: toLazyObservable(descriptor.disabled),
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: filter && {
          placeholder: toLazyObservable(filter.placeholder),
          notFoundText: toLazyObservable(filter.notFoundText),
        } as RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>}> | undefined,
      },
      cssClass: descriptor.cssClass,
    }, (menu: WorkbenchMenuFactory): void => {
      menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu));
    });

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciMenuFactory) => void): this;
  public addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciMenuFactory) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    this._delegate.addGroup({
      name: descriptor.name,
      label: toLazyObservable(descriptor.label),
      collapsible: descriptor.collapsible,
      disabled: toLazyObservable(descriptor.disabled),
      actions: (actions: WorkbenchToolbarFactory): void => {
        const sciToolbar = new WorkbenchClientToolbarFactoryDelegate(actions);
        descriptor.actions?.(sciToolbar);
      },
      cssClass: descriptor.cssClass,
    }, (group: WorkbenchMenuFactory): void => {
      groupFactoryFn?.(new WorkbenchClientMenuFactoryDelegate(group));
    });

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

function coerceGroupDescriptor(factoryOrDescriptor: ((group: SciMenuFactory) => void) | SciMenuGroupDescriptor, factoryIfDescriptor?: (group: SciMenuFactory) => void): [SciMenuGroupDescriptor, ((group: SciMenuFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceLabel(label: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor): MaybeSignal<string> {
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }

  throw Error('[MenuDefinitionError] Component not supported as label in microfrontend menu.');
}

function coerceFilterDescriptor(menuDescriptor: SciMenuDescriptor): {placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>} | undefined {
  const filter = menuDescriptor.menu?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
    };
  }
  return filter === true ? {} : undefined;
}

function coerceIcon(icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (icon === undefined) {
    return undefined;
  }
  if (typeof icon === 'string' || isSignal(icon)) {
    return icon;
  }

  throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
}
