/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

export interface SciMenu {
  // Describe that onSelect can call `inject` to get any required dependencies.
  addMenuItem(descriptor: SciMenuItemDescriptor, onSelect: (context: Map<string, unknown>) => boolean | void): this;

  addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(groupFactoryFn: (group: SciMenuGroup) => SciMenuGroup): this;

  addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuGroup) => SciMenuGroup): this;
}

export type SciMenuGroup = SciMenu;

export interface SciMenuItemDescriptor {
  name?: `menuitem:${string}` | `menuitem:${string}`[];
  id?: `menuitem:${string}`;
  label: string | Signal<string> | ComponentType<unknown>;
  icon?: string | Signal<string>;
  checked?: boolean | Signal<boolean>;
  tooltip?: string | Signal<string>;
  accelerator?: string[];
  disabled?: boolean | Signal<boolean>;
  actionToolbarName?: Signal<`toolbar:${string}` | undefined> | `toolbar:${string}`;
  // actions?: (toolbar: SciToolbar) => SciMenu;
  onFilter?: (filter: string) => boolean;
  cssClass?: string | string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuDescriptor {
  name?: `menu:${string}` | `menu:${string}`[];
  id?: `menu:${string}`;
  label: string | Signal<string> | ComponentType<unknown>;
  icon?: string | Signal<string>;
  tooltip?: string | Signal<string>;
  disabled?: boolean | Signal<boolean>;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string | string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuGroupDescriptor {
  name?: `group:${string}` | `group:${string}`[];
  id?: `group:${string}`;
  label?: string | Signal<string>;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: boolean | Signal<boolean>;
  cssClass?: string | string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}
