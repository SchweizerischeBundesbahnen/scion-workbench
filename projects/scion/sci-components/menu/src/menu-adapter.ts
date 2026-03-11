/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Signal} from '@angular/core';
import {SciMenuOptions, SciMenuRef} from './menu.service';
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciDefaultMenuAdapter} from './default-menu-adapter';
import {SciToolbarContribution, SciMenuContribution} from './menu-contribution.model';

@Injectable({providedIn: 'root', useExisting: SciDefaultMenuAdapter})
export abstract class SciMenuAdapter {

  public abstract contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution, next: SciMenuAdapter): Disposable;

  public abstract menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>, next: SciMenuAdapter): Signal<SciMenuItemLike[]>;

  /**
   * TODO Optional or required?
   */
  public openMenu?(menuItems: SciMenuItemLike[], options: Omit<SciMenuOptions, 'context'>): SciMenuRef;
}
