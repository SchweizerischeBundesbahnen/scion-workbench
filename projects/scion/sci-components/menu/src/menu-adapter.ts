/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, Signal} from '@angular/core';
import {SciMenuOptions} from './menu.service';
import {SciMenuContributionUnion} from './menu-contribution.model';
import {Disposable} from './common/disposable';

export const SCI_MENU_ADAPTER = new InjectionToken<SciMenuAdapter>('SCI_MENU_ADAPTER');

export interface SciMenuAdapter {

  openMenu(menuName: `menu:${string}`, options: SciMenuOptions): SciMenuRef;

  contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contributions: SciMenuContributionUnion[]): Disposable;

  menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`): Signal<SciMenuContributionUnion[]>;
}

export interface SciMenuRef {
  close(): void;
}
