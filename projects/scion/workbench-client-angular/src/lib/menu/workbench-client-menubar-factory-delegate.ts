/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMenubarFactory} from '@scion/workbench-client';
import {SciMenubarFactory, SciMenubarMenuDescriptor, SciMenuFactory} from '@scion/components/menu';
import {coerceWorkbenchMenuDescriptor, WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {toLazyObservable} from '@scion/components/common';

/**
 * Represents a {@link SciMenubarFactory} that delegates to {@link WorkbenchMenubarFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientMenubarFactoryDelegate implements SciMenubarFactory {

  constructor(private readonly _delegate: WorkbenchMenubarFactory) {
  }

  /** @inheritDoc */
  public addMenu(descriptor: SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    this._delegate.addMenu({
      name: descriptor.name,
      label: toLazyObservable(descriptor.label),
      visible: toLazyObservable(descriptor.visible),
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      menu: coerceWorkbenchMenuDescriptor(descriptor.menu),
    }, menu => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu)));

    return this;
  }
}
