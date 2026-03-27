/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeObservable} from '../common/utility-types';
import {WorkbenchToolbarFactory} from './workbench-toolbar.factory';

export interface WorkbenchMenuFactory {
  // Describe that onSelect can call `inject` to get any required dependencies.
  addMenuItem(label: MaybeObservable<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;

  addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;

  addMenu(label: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: WorkbenchMenuGroupFactory) => void): this;

  addGroup(descriptor: WorkbenchMenuGroupDescriptor, groupFactoryFn?: (group: WorkbenchMenuGroupFactory) => void): this;

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

export type WorkbenchMenuGroupFactory = WorkbenchMenuFactory;

export interface WorkbenchMenuItemDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeObservable<string>;
  icon?: MaybeObservable<string>;
  checked?: MaybeObservable<boolean>;
  tooltip?: MaybeObservable<string>;
  accelerator?: string[];
  disabled?: MaybeObservable<boolean>;
  actions?: (actions: WorkbenchToolbarFactory) => void;
  onFilter?: (filter: string) => boolean;
  cssClass?: string | string[];
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface WorkbenchMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeObservable<string>;
  icon?: MaybeObservable<string>;
  tooltip?: MaybeObservable<string>;
  disabled?: MaybeObservable<boolean>;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string | string[];
}

export interface WorkbenchMenuGroupDescriptor {
  name?: `group:${string}`;
  label?: MaybeObservable<string>;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: MaybeObservable<boolean>;
  cssClass?: string | string[];
}
