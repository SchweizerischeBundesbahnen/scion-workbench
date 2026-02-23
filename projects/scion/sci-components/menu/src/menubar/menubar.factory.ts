/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciMenuFactory} from '../menu/menu.factory';
import {MaybeSignal, RequireOne} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

export interface SciMenubarFactory {

  addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this;

  addMenu(descriptor: SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this;
}

export interface SciMenubarMenuDescriptor {
  name?: `menu:${string}`;
  label: MaybeSignal<Translatable>;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  filter?: boolean | RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}>;
  cssClass?: string | string[];
}
