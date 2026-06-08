/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeObservable, RequireOne} from '@scion/toolkit/types';
import {WorkbenchToolbarFactory} from './workbench-toolbar.factory';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchKeyboardAccelerator} from './workbench-menu-accelerators';

export interface WorkbenchMenuFactory {

  addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;

  addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: WorkbenchMenuFactory) => void): this;

  addGroup(descriptor: WorkbenchMenuGroupDescriptor, groupFactoryFn?: (group: WorkbenchMenuFactory) => void): this;

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

export interface WorkbenchMenuItemDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeObservable<Translatable>;
  icon?: MaybeObservable<string>;
  checked?: MaybeObservable<boolean>;
  active?: MaybeObservable<boolean>;
  tooltip?: MaybeObservable<Translatable>;
  accelerator?: WorkbenchKeyboardAccelerator;
  disabled?: MaybeObservable<boolean>;
  visible?: MaybeObservable<boolean>;
  actions?: (actions: WorkbenchToolbarFactory) => void;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  onSelect: () => void | boolean | Promise<void | boolean>;
}

export interface WorkbenchMenuDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeObservable<Translatable>;
  icon?: MaybeObservable<string>;
  disabled?: MaybeObservable<boolean>;
  visible?: MaybeObservable<boolean>;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  menu?: {
    name?: `menu:${string}`;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | RequireOne<WorkbenchMenuFilterConfig>;
  };
}

export interface WorkbenchMenuGroupDescriptor {
  name?: `menu:${string}`;
  label?: MaybeObservable<Translatable>;
  collapsible?: boolean | {collapsed: boolean};
  /**
   * TODO [menu]: Explain what glyph area is.
   *
   * Controls whether to hide the glyph area in this group.
   * Defaults to displaying the glyph area if any menu item contained in the menu or its groups has an icon or is checkable.
   */
  glyphArea?: false;
  disabled?: MaybeObservable<boolean>;
  visible?: MaybeObservable<boolean>;
  actions?: (actions: WorkbenchToolbarFactory) => void;
  cssClass?: string | string[];
}

/**
 * Features of the menu filter field.
 */
export interface WorkbenchMenuFilterConfig<T = MaybeObservable<Translatable>> {
  placeholder?: T;
  notFoundMessage?: T;
  focus?: boolean;
}
