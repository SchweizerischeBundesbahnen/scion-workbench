/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciMenuGroup, SciMenuItem, SciSubMenuItem} from './ɵmenu';
import {InjectionToken, Signal} from '@angular/core';
import {SciMenuOptions} from './menu.service';

export const SCI_MENU_ADAPTER = new InjectionToken<SciMenuAdapter>('SCI_MENU_ADAPTER');

export interface SciMenuAdapter {

  openMenu(menuName: `menu:${string}`, options: SciMenuOptions): SciMenuRef;

  menuContributions(name: `menubar:${string}` | `toolbar:${string}` | `menu:${string}`): Signal<SciMenuElement[]>;

  contributeMenu(name: `menubar:${string}` | `toolbar:${string}` | `menu:${string}`, contributions: SciMenuElement[]): SciMenuContribution;
}

export interface SciMenuRef {
  close(): void;
}

export interface SciMenuContribution {
  remove(): void;
}


export type SciMenuElement = SciMenuItem | SciSubMenuItem | SciMenuGroup;
