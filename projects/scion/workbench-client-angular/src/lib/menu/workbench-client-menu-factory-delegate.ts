/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMenuDescriptor, WorkbenchMenuFactory, WorkbenchToolbarFactory} from '@scion/workbench-client';
import {MaybeObservable, RequireOne} from '@scion/toolkit/types';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '@scion/components/menu';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {MaybeSignal, SciComponentDescriptor, toLazyObservable} from '@scion/components/common';
import {Translatable} from '@scion/components/text';

/**
 * Represents a {@link SciMenuFactory} that delegates to {@link WorkbenchMenuFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientMenuFactoryDelegate implements SciMenuFactory {

  private readonly _injector = inject(Injector);

  constructor(private readonly _delegate: WorkbenchMenuFactory) {
  }

  /** @inheritDoc */
  public addMenuItem(descriptor: SciMenuItemDescriptor): this {
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
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(coerceLabel(descriptor.label)),
      icon: toLazyObservable(coerceIcon(descriptor.icon)),
      disabled: toLazyObservable(descriptor.disabled),
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      menu: coerceWorkbenchMenuDescriptor(descriptor.menu),
    }, menu => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu)));

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
      glyphArea: descriptor.glyphArea,
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

function coerceIcon(icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (icon === undefined) {
    return undefined;
  }
  if (typeof icon === 'string' || isSignal(icon)) {
    return icon;
  }

  throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
}

export function coerceWorkbenchMenuDescriptor(menuDescriptor: SciMenuDescriptor['menu']): WorkbenchMenuDescriptor['menu'] | undefined {
  if (!menuDescriptor) {
    return undefined;
  }

  const filterDescriptor = coerceFilterDescriptor(menuDescriptor);
  return {
    name: menuDescriptor.name,
    width: menuDescriptor.width,
    minWidth: menuDescriptor.minWidth,
    maxWidth: menuDescriptor.maxWidth,
    maxHeight: menuDescriptor.maxHeight,
    filter: filterDescriptor && {
      placeholder: toLazyObservable(filterDescriptor.placeholder),
      notFoundText: toLazyObservable(filterDescriptor.notFoundText),
      focus: filterDescriptor.focus,
    } as RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>; focus?: boolean}> | undefined,
  };
}

function coerceFilterDescriptor(menuDescriptor?: SciMenuDescriptor['menu']): {placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean} | undefined {
  const filter = menuDescriptor?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
      focus: filter.focus,
    };
  }
  return filter === true ? {} : undefined;
}
