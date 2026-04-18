/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeObservable, RequireOne} from '../common/utility-types';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {Translatable} from '../text/workbench-text-provider.model';

export interface WorkbenchMenubarFactory {

  addMenu(label: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addMenu(descriptor: WorkbenchMenubarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  /**
   * Instructs the menu to re-create, invoking the menu factory function anew.
   *
   * Use if menu items depend on conditions that have changed.
   */
  invalidate: () => void;
  /**
   * Registers a callback to be executed when the menu is re-created (due to invalidation) or disposed.
   *
   * Use for cleaning up allocated resources like subscriptions.
   */
  onCleanup: (onCleanup: () => void) => void;
}

export interface WorkbenchMenubarMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeObservable<Translatable>;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>}>;
  };
  cssClass?: string | string[];
}
