/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Injector, Signal} from '@angular/core';
import {SciMenuOptions, SciMenuRef} from './menu.service';
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciDefaultMenuAdapter} from './default-menu-adapter';
import {SciMenuContribution, SciToolbarContribution} from './menu-contribution.model';

@Injectable({providedIn: 'root', useExisting: SciDefaultMenuAdapter})
export abstract class SciMenuAdapter {

  public abstract contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): Disposable;

  /**
   * The function:
   * - Must be called within an injection context, or an explicit {@link Injector} passed.
   * - Must be called in a non-reactive (non-tracking) context.
   */
  public abstract menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options?: {injector?: Injector}): Signal<SciMenuItemLike[]>;

  /**
   * TODO Optional or required?
   */
  public openMenu?(menuItems: Signal<SciMenuItemLike[]>, options: Omit<SciMenuOptions, 'context'>): SciMenuRef;
}
