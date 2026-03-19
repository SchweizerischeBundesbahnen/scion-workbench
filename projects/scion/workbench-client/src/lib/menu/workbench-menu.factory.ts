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
import {WorkbenchToolbarFactory} from './workbench-toolbar.factory';

export interface WorkbenchMenuFactory {
  // Describe that onSelect can call `inject` to get any required dependencies.
  addMenuItem(label: MaybeAsync<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;

  addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;

  addMenu(label: MaybeAsync<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: WorkbenchMenuGroupFactory) => void): this;

  addGroup(descriptor: WorkbenchMenuGroupDescriptor, groupFactoryFn?: (group: WorkbenchMenuGroupFactory) => void): this;
}

export type WorkbenchMenuGroupFactory = WorkbenchMenuFactory;

export interface WorkbenchMenuItemDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeAsync<string>;
  icon?: MaybeAsync<string>;
  checked?: MaybeAsync<boolean>;
  tooltip?: MaybeAsync<string>;
  accelerator?: string[];
  disabled?: MaybeAsync<boolean>;
  actions?: (actions: WorkbenchToolbarFactory) => void;
  onFilter?: (filter: string) => boolean;
  cssClass?: string | string[];
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface WorkbenchMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeAsync<string>;
  icon?: MaybeAsync<string>;
  tooltip?: MaybeAsync<string>;
  disabled?: MaybeAsync<boolean>;
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
  label?: MaybeAsync<string>;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: MaybeAsync<boolean>;
  cssClass?: string | string[];
}
