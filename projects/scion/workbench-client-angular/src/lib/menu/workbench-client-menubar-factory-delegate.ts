/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable, WorkbenchMenubarFactory, WorkbenchMenuFactory} from '@scion/workbench-client';
import {MaybeObservable, RequireOne} from '@scion/toolkit/types';
import {isSignal} from '@angular/core';
import {SciMenubarFactory, SciMenubarMenuDescriptor, SciMenuFactory} from '@scion/components/menu';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {toLazyObservable} from '../common/lazy-observable.util';
import {MaybeSignal} from '@scion/components/common';

/**
 * Represents a {@link SciMenubarFactory} that delegates to {@link WorkbenchMenubarFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientMenubarFactoryDelegate implements SciMenubarFactory {

  constructor(private readonly _delegate: WorkbenchMenubarFactory) {
  }

  /** @inheritDoc */
  public addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(descriptor: SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
  public addMenu(labelOrDescriptor: MaybeSignal<Translatable> | SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);
    const filter = coerceFilterDescriptor(descriptor);

    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(descriptor.label),
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
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeSignal<string> | SciMenubarMenuDescriptor): SciMenubarMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isSignal(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceFilterDescriptor(menuDescriptor: SciMenubarMenuDescriptor): {placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean} | undefined {
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
