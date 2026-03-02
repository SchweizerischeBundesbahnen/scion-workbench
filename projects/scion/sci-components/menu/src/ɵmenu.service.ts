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
import {computed, inject, Injectable, Injector, Signal} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {coerceArray} from '@angular/cdk/coercion';
import {SciMenu} from './menu/menu.model';
import {contributeMenu} from './menu-contribution';
import {SciMenuAdapter} from './menu-adapter';
import {SciMenuContributions} from './menu-contribution.model';
import {Disposable} from './common/disposable';
import {sortMenuContributions} from './menu-contribution-sorter';
import {SciDefaultMenuAdapter} from './default-menu-adapter';

@Injectable({providedIn: 'root'})
export class ɵSciMenuService implements SciMenuService {

  private readonly _menuAdapter = inject(SciMenuAdapter);
  private readonly _defaultMenuAdapter = inject(SciDefaultMenuAdapter);
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public open(argument: `menu:${string}` | `menu:${string}`[] | ((menu: SciMenu) => SciMenu), options: SciMenuOptions): SciMenuRef {
    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
    }

    // Open menu for specified location.
    if (typeof argument !== 'function') {
      return this.openMenu(argument, options);
    }

    // Open menu using passed menu factory.
    const location = `menu:${UUID.randomUUID()}` as const;
    const contributionRef = contributeMenu(location, argument, {injector: this._injector});

    try {
      const menuRef = this.openMenu(location, options);
      menuRef.onClose(() => contributionRef.dispose());
      return menuRef;
    }
    catch (error) {
      contributionRef.dispose();
      throw error;
    }
  }

  /** @inheritDoc */
  public menuContributions(locations: Array<`menu:${string}` | `toolbar:${string}` | `group:${string}`>): Signal<SciMenuContributions> {
    return computed(() => sortMenuContributions(locations.reduce((contributions, location) => contributions.concat(this._menuAdapter.menuContributions(location)()), [] as SciMenuContributions)));
  }

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contributions: SciMenuContributions): Disposable {
    return this._menuAdapter.contributeMenu(location, contributions);
  }

  private openMenu(location: `menu:${string}` | `menu:${string}`[], options: SciMenuOptions): SciMenuRef {
    if (this._menuAdapter.openMenu) {
      return this._menuAdapter.openMenu(coerceArray(location), options);
    }
    else {
      return this._defaultMenuAdapter.openMenu(coerceArray(location), options);
    }
  }
}
