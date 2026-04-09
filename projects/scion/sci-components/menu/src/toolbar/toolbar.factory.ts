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
import {SciMenuFactory} from '../menu/menu.factory';
import {MaybeSignal, RequireOne, SciComponentDescriptor} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

export interface SciToolbarFactory {

  // Describe that onSelect can call `inject` to get any required dependencies.
  addToolbarItem(icon: MaybeSignal<string>, onSelect: () => void): this;

  addToolbarItem(descriptor: SciToolbarItemDescriptor): this;

  addToolbarItem(descriptor: SciToolbarControlDescriptor): this;

  addMenu(icon: string | MaybeSignal<string>, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addGroup(groupFactoryFn: (group: SciToolbarFactory) => void): this;

  addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarFactory) => void): this;
}

export interface SciToolbarItemDescriptor {
  name?: `menuitem:${string}`;
  label?: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor;
  icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor;
  checked?: MaybeSignal<boolean>;
  tooltip?: MaybeSignal<Translatable>;
  accelerator?: string[];
  disabled?: MaybeSignal<boolean>;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  onSelect: () => boolean | void | Promise<boolean | void>;
}

export interface SciToolbarControlDescriptor {
  name?: `menuitem:${string}`;
  control: ComponentType<unknown> | SciComponentDescriptor;
  tooltip?: MaybeSignal<Translatable>;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
}

export interface SciToolbarMenuDescriptor {
  name?: `menu:${string}`;
  label?: MaybeSignal<Translatable> | ComponentType<unknown> | SciComponentDescriptor;
  icon?: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor;
  tooltip?: MaybeSignal<Translatable>;
  disabled?: MaybeSignal<boolean>;
  /**
   * Controls the display of a visual marker for menu dropdown. Defaults to `true`.
   */
  visualMenuHint?: boolean;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>}>;
  };
  cssClass?: string | string[];
}

export interface SciToolbarGroupDescriptor {
  name?: `toolbar:${string}:${string}`;
  disabled?: MaybeSignal<boolean>;
  cssClass?: string | string[];
}
