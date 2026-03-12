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
import {inject, Injectable, Injector, Provider, signal, Signal} from '@angular/core';
import {SciMenuItemLike} from './menu.model';
import {Disposable} from './common/disposable';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';
import {SciMenuAdapter} from './menu-adapter';
import {SciDefaultMenuAdapter} from './default-menu-adapter';
import {SciMenuContribution, SciToolbarContribution} from './menu-contribution.model';
import {MaybeSignal} from './common/utility-types';
import {createDestroyableInjector} from './common/injector.util';

@Injectable({providedIn: 'root'})
export class ɵSciMenuService implements SciMenuService {

  private readonly _injector = inject(Injector);
  private readonly _menuAdapter = inject(SciMenuAdapter);
  private readonly _defaultMenuAdapter = inject(SciDefaultMenuAdapter);
  private readonly _environmentContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());

  /** @inheritDoc */
  public open(name: `menu:${string}`, options: SciMenuOptions): SciMenuRef;
  public open(menuItems: SciMenuItemLike[], options: Omit<SciMenuOptions, 'context'>): SciMenuRef;
  public open(menuItemsOrName: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    const context = new Map([...this._environmentContext?.() ?? new Map(), ...options.context ?? new Map()]);

    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
      options.anchor.stopPropagation();
    }

    const injector = createDestroyableInjector({parent: this._injector});

    const menuContributions = Array.isArray(menuItemsOrName) ? signal(menuItemsOrName) : this.menuContributions(menuItemsOrName, context, {injector});
    if (this._menuAdapter.openMenu) {
      const menuRef = this._menuAdapter.openMenu(menuContributions, options);
      menuRef.onClose(() => injector.destroy());
      return menuRef;
    }
    else {
      const menuRef = this._defaultMenuAdapter.openMenu(menuContributions, options);
      menuRef.onClose(() => injector.destroy());
      return menuRef;
    }
  }

  /** @inheritDoc */
  public menuContributions(location: MaybeSignal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: MaybeSignal<Map<string, unknown>>, options?: {injector?: Injector}): Signal<SciMenuItemLike[]> {
    return this._menuAdapter.menuContributions(coerceSignal(location), coerceSignal(context), options);
  }

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): Disposable {
    return this._menuAdapter.contributeMenu(location, contribution);
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

