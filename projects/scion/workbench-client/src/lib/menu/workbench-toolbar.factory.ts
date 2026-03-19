/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MaybeAsync} from '../common/utility-types';
import {WorkbenchMenuFactory} from './workbench-menu.factory';

export interface WorkbenchToolbarFactory {

  // Describe that onSelect can call `inject` to get any required dependencies.
  addToolbarItem(icon: MaybeAsync<string>, onSelect: () => void): this;

  addToolbarItem(descriptor: WorkbenchToolbarItemDescriptor): this;

  addMenu(icon: string | MaybeAsync<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addMenu(descriptor: WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: WorkbenchToolbarGroupFactory) => void): this;

  addGroup(descriptor: WorkbenchToolbarGroupDescriptor, groupFactoryFn?: (group: WorkbenchToolbarGroupFactory) => void): this;
}

export type WorkbenchToolbarGroupFactory = WorkbenchToolbarFactory;

export interface WorkbenchToolbarItemDescriptor {
  name?: `menuitem:${string}`;
  label?: MaybeAsync<string>;
  icon: MaybeAsync<string>;
  checked?: MaybeAsync<boolean>;
  tooltip?: MaybeAsync<string>;
  accelerator?: string[];
  disabled?: MaybeAsync<boolean>;
  cssClass?: string | string[];
  onSelect: () => void;
}

export interface WorkbenchToolbarMenuDescriptor {
  name?: `menu:${string}`;
  label?: MaybeAsync<string>;
  icon?: MaybeAsync<string>;
  tooltip?: MaybeAsync<string>;
  disabled?: MaybeAsync<boolean>;
  /**
   * Controls the display of a visual marker for menu dropdown. Defaults to `true`.
   */
  visualMenuHint?: boolean;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string | string[];
}

export interface WorkbenchToolbarGroupDescriptor {
  name?: `group:${string}`;
  disabled?: MaybeAsync<boolean>;
  cssClass?: string | string[];
}
