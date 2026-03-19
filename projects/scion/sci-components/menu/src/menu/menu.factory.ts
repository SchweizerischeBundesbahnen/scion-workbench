/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentType} from '@angular/cdk/portal';
import {SciToolbarFactory} from '../toolbar/toolbar.factory';
import {MaybeSignal} from '../common/utility-types';

export interface SciMenuFactory {
  // Describe that onSelect can call `inject` to get any required dependencies.
  addMenuItem(label: MaybeSignal<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;

  addMenuItem(descriptor: SciMenuItemDescriptor): this;

  addMenu(label: MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: SciMenuGroupFactory) => void): this;

  addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuGroupFactory) => void): this;
}

export type SciMenuGroupFactory = SciMenuFactory;

export interface SciMenuItemDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeSignal<string> | ComponentType<unknown>;
  icon?: MaybeSignal<string>;
  checked?: MaybeSignal<boolean>;
  tooltip?: MaybeSignal<string>;
  accelerator?: string[];
  disabled?: MaybeSignal<boolean>;
  actions?: (actions: SciToolbarFactory) => void;
  onFilter?: (filter: string) => boolean;
  cssClass?: string | string[];
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface SciMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeSignal<string> | ComponentType<unknown>;
  icon?: MaybeSignal<string>;
  tooltip?: MaybeSignal<string>;
  disabled?: MaybeSignal<boolean>;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string | string[];
}

export interface SciMenuGroupDescriptor {
  name?: `group:${string}`;
  label?: MaybeSignal<string>;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: MaybeSignal<boolean>;
  cssClass?: string | string[];
}
