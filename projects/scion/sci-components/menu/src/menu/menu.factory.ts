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
import {MaybeSignal, RequireOne, SciComponentDescriptor} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

export interface SciMenuFactory {
  // Describe that onSelect can call `inject` to get any required dependencies.
  addMenuItem(label: MaybeSignal<Translatable>, onSelect: () => boolean | void | Promise<boolean | void>): this;

  addMenuItem(descriptor: SciMenuItemDescriptor): this;

  addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addMenu(descriptor: SciMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: SciMenuFactory) => void): this;

  addGroup(descriptor: SciMenuGroupDescriptor, groupFactoryFn?: (group: SciMenuFactory) => void): this;
}

export interface SciMenuItemDescriptor {
  name?: `menuitem:${string}`;
  label: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor;
  icon?: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor;
  checked?: MaybeSignal<boolean>;
  tooltip?: MaybeSignal<Translatable>;
  accelerator?: string[];
  disabled?: MaybeSignal<boolean>;
  actions?: (actions: SciToolbarFactory) => void;
  onFilter?: (filter: string) => boolean;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface SciMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor;
  icon?: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor;
  disabled?: MaybeSignal<boolean>;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>}>;
  };
  cssClass?: string | string[];
}

export interface SciMenuGroupDescriptor {
  name?: `menu:${string}`;
  label?: MaybeSignal<Translatable>;
  collapsible?: boolean | {collapsed: boolean};
  disabled?: MaybeSignal<boolean>;
  cssClass?: string | string[];
}
