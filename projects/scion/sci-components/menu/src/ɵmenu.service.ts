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
import {coerceArray} from '@angular/cdk/coercion';
import {SciMenuAdapter} from './menu-adapter';
import {SciMenuContributions} from './menu-contribution.model';
import {Disposable} from './common/disposable';
import {sortMenuContributions} from './menu-contribution-sorter';
import {SciDefaultMenuAdapter} from './default-menu-adapter';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';

@Injectable({providedIn: 'root'})
export class ɵSciMenuService implements SciMenuService {

  private readonly _menuAdapter = inject(SciMenuAdapter);
  private readonly _defaultMenuAdapter = inject(SciDefaultMenuAdapter);
  private readonly _environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());

  /** @inheritDoc */
  public open(name: `menu:${string}` | `menu:${string}`[], options: SciMenuOptions): SciMenuRef {
    const mergedContext = new Map([...this._environmentMenuContext?.() ?? new Map(), ...options.context ?? new Map()]);

    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
    }

    if (this._menuAdapter.openMenu) {
      return this._menuAdapter.openMenu(coerceArray(name), {...options, context: mergedContext});
    }
    else {
      return this._defaultMenuAdapter.openMenu(coerceArray(name), {...options, context: mergedContext});
    }
  }

  /** @inheritDoc */
  public menuContributions(location: Array<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Map<string, unknown>): Signal<SciMenuContributions> {
    return computed(() => sortMenuContributions(location.reduce((contributions, location) => contributions.concat(this._menuAdapter.menuContributions(location, context)()), [] as SciMenuContributions)));
  }

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contributions: SciMenuContributions, context: Map<string, unknown>): Disposable {
    return this._menuAdapter.contributeMenu(location, contributions, context);
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
