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
import {SciGroupContribution2, SciMenuContribution2, SciMenuContributions} from './menu-contribution.model';
import {SciDefaultMenuAdapter} from './default-menu-adapter';

@Injectable({providedIn: 'root', useExisting: SciDefaultMenuAdapter})
export abstract class SciMenuAdapter {

  public abstract contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contribution: SciMenuContribution2 | SciGroupContribution2, next: SciMenuAdapter): Disposable;

  public abstract menuContributions(location: `menu:${string}`[] | `toolbar:${string}`[] | `group:${string}`[], context: Map<string, unknown>, next: SciMenuAdapter): Signal<SciMenuContributions>;

  /**
   * TODO Optional or required?
   */
  public openMenu?(menuItems: SciMenuContributions, options: Omit<SciMenuOptions, 'context'>): SciMenuRef;
}
