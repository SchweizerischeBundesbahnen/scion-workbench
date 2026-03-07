/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciMenuOptions, SciMenuRef, SciMenuService} from './menu.service';
import {computed, inject, Injectable, Provider, Signal} from '@angular/core';
import {SciGroupContribution2, SciMenuContribution2, SciMenuContributions} from './menu-contribution.model';
import {Disposable} from './common/disposable';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';
import {SciMenuAdapter} from './menu-adapter';
import {SciDefaultMenuAdapter} from './default-menu-adapter';

@Injectable({providedIn: 'root'})
export class ɵSciMenuService implements SciMenuService {

  private readonly _menuAdapter = inject(SciMenuAdapter);
  private readonly _defaultMenuAdapter = inject(SciDefaultMenuAdapter);
  private readonly _environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());

  /** @inheritDoc */
  public open(name: `menu:${string}`, options: SciMenuOptions): SciMenuRef;
  public open(menuItems: SciMenuContributions, options: Omit<SciMenuOptions, 'context'>): SciMenuRef;
  public open(nameOrMenuItems: `menu:${string}` | SciMenuContributions, options: SciMenuOptions): SciMenuRef {
    const mergedContext = new Map([...this._environmentMenuContext?.() ?? new Map(), ...options.context ?? new Map()]);

    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
    }

    const menuContributions = typeof nameOrMenuItems === 'string' ? this.menuContributions(nameOrMenuItems, mergedContext)() : nameOrMenuItems;
    if (this._menuAdapter.openMenu) {
      return this._menuAdapter.openMenu(menuContributions, options);
    }
    else {
      return this._defaultMenuAdapter.openMenu(menuContributions, options);
    }
  }

  /** @inheritDoc */
  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Signal<SciMenuContributions> {
    return computed(() => this._menuAdapter.menuContributions(location, context, this._defaultMenuAdapter)());
  }

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contribution: SciMenuContribution2 | SciGroupContribution2): Disposable {
    return this._menuAdapter.contributeMenu(location, contribution, this._defaultMenuAdapter);
  }
}

/**
 * Provides {@link WorkbenchDialogService} for dependency injection.
 */
export function provideSciMenuService(): Provider[] {
  return [
    ɵSciMenuService,
    {provide: SciMenuService, useExisting: ɵSciMenuService},
  ];
}

