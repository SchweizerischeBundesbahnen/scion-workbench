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
import {SciMenu} from '../menu/menu.model';

export interface SciToolbar {

  addToolbarItem(descriptor: SciToolbarItemDescriptor, onSelect: () => void): this;

  addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenu) => SciMenu): this;

  addGroup(groupFactoryFn: (group: SciToolbarGroup) => SciToolbarGroup): this;

  addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarGroup) => SciToolbarGroup): this;
}

export type SciToolbarGroup = SciToolbar;

export interface SciToolbarItemDescriptor {
  name?: `menuitem:${string}`;
  label?: string | Signal<string> | ComponentType<unknown>;
  icon?: string | Signal<string>;
  checked?: boolean | Signal<boolean>;
  tooltip?: string | Signal<string>;
  accelerator?: string[];
  disabled?: boolean | Signal<boolean>;
  cssClass?: string | string[];
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
}

export interface SciToolbarGroupDescriptor {
  name?: `group:${string}`;
  disabled?: boolean | Signal<boolean>;
}
