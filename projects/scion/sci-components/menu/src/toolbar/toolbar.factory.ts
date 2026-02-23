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
import {SciMenuFactory} from '../menu/menu.factory';

export interface SciToolbarFactory {

  // Describe that onSelect can call `inject` to get any required dependencies.
  addToolbarItem(icon: string | Signal<string>, onSelect: () => void): this;

  addToolbarItem(descriptor: SciToolbarItemDescriptor): this;

  addMenu(icon: string | Signal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: SciToolbarGroupFactory) => void): this;

  addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroupFactory) => void): this;
}

export type SciToolbarGroupFactory = SciToolbarFactory;

export interface SciToolbarItemDescriptor {
  name?: `menuitem:${string}`;
  label?: string | Signal<string> | ComponentType<unknown>;
  icon: string | Signal<string>;
  checked?: boolean | Signal<boolean>;
  tooltip?: string | Signal<string>;
  accelerator?: string[];
  disabled?: boolean | Signal<boolean>;
  cssClass?: string | string[];
  onSelect: () => void;
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciToolbarMenuDescriptor {
  name?: `menu:${string}`;
  label?: Signal<string> | string | ComponentType<unknown>;
  icon?: string | Signal<string>;
  tooltip?: string | Signal<string>;
  disabled?: boolean | Signal<boolean>;
  /**
   * Controls the display of a visual marker for menu dropdown. Defaults to `true`.
   */
  visualMenuHint?: boolean;
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

export interface SciToolbarGroupDescriptor {
  name?: `group:${string}`;
  disabled?: boolean | Signal<boolean>;
  cssClass?: string | string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}
