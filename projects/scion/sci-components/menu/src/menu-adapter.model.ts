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
import {SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFnLike} from './menu-contribution.model';

/**
 * Allows intercepting calls to the menu registry.
 *
 * Adapters can handle or augment calls. Multiple adapters form a chain and are called one by one in registration order.
 *
 * Calling 'next' passes the call to the next adapter, or to the registry if it is the last adapter in the chain.
 */
@Injectable()
export abstract class SciMenuAdapter {

  public abstract contributeMenu?(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions, next: SciMenuAdapterChain): Disposable;

  public abstract menuContributions?(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector}, next: SciMenuAdapterChain): Signal<SciMenuItemLike[]>;

  public abstract openMenu?(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions, next: SciMenuAdapterChain): SciMenuRef;
}

/**
 * Represents the next adapter in the adapter chain.
 */
export interface SciMenuAdapterChain {

  contributeMenu(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable;

  menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector}): Signal<SciMenuItemLike[]>;

  openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef;
}
