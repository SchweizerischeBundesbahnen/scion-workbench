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

export interface WorkbenchToolbarFactory {

  // Describe that onSelect can call `inject` to get any required dependencies.
  addToolbarItem(icon: MaybeObservable<string>, onSelect: () => void): this;

  addToolbarItem(descriptor: WorkbenchToolbarItemDescriptor): this;

  addMenu(icon: string | MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addMenu(descriptor: WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: WorkbenchToolbarGroupFactory) => void): this;

  addGroup(descriptor: WorkbenchToolbarGroupDescriptor, groupFactoryFn?: (group: WorkbenchToolbarGroupFactory) => void): this;

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

export type WorkbenchToolbarGroupFactory = WorkbenchToolbarFactory;

export interface WorkbenchToolbarItemDescriptor {
  name?: `menuitem:${string}`;
  label?: MaybeObservable<Translatable>;
  icon: MaybeObservable<string>;
  checked?: MaybeObservable<boolean>;
  tooltip?: MaybeObservable<Translatable>;
  accelerator?: string[];
  disabled?: MaybeObservable<boolean>;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface WorkbenchToolbarMenuDescriptor {
  name?: `menu:${string}`;
  label?: MaybeObservable<Translatable>;
  icon?: MaybeObservable<string>;
  tooltip?: MaybeObservable<Translatable>;
  disabled?: MaybeObservable<boolean>;
  /**
   * Controls the display of a visual marker for menu dropdown. Defaults to `true`.
   */
  visualMenuHint?: boolean;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>}>;
  };
  cssClass?: string | string[];
}

export interface WorkbenchToolbarGroupDescriptor {
  name?: `group:${string}`;
  disabled?: MaybeObservable<boolean>;
  cssClass?: string | string[];
}
