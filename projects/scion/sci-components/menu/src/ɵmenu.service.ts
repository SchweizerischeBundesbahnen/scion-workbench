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
import {inject, Injectable, Injector, Provider, Signal} from '@angular/core';
import {SciMenuItemLike} from './menu.model';
import {Disposable} from './common/disposable';
import {SciMenuContextProvider} from './menu-context-provider';
import {SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFnLike} from './menu-contribution.model';
import {coerceSignal, MaybeSignal} from '@scion/sci-components/common';
import {SciMenuRegistry} from './menu.registry';
import {SciMenuAdapter, SciMenuAdapterChain} from './menu-adapter.model';

/**
 * @docs-private Not public API. For internal use only.
 */
@Injectable({providedIn: 'root'})
export class ɵSciMenuService implements SciMenuService {

  private readonly _menuRegistry = interceptMenuRegistry(inject(SciMenuRegistry));
  private readonly _environmentContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());

  /** @inheritDoc */
  public open(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    const context = new Map([...this._environmentContext?.() ?? new Map(), ...options.context ?? new Map()]);

    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
      options.anchor.stopPropagation();
    }

    return this._menuRegistry.openMenu(menu, {...options, context});
  }

  /**
   * The function:
   * - Must be called within an injection context, or an explicit {@link Injector} passed.
   * - Must be called in a non-reactive (non-tracking) context.
   *
   * metadata: Arbitrary metadata to be associated with the operation.
   */
  public menuItems(location: MaybeSignal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: MaybeSignal<Map<string, unknown>>, options?: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]> {
    return this._menuRegistry.menuItems(coerceSignal(location), coerceSignal(context), options ?? {});
  }

  public menuContributions(location: MaybeSignal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: MaybeSignal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuContribution[]> {
    return this._menuRegistry.menuContributions(coerceSignal(location), coerceSignal(context), options ?? {});
  }

  public contributeMenu(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options?: SciMenuContributionOptions): Disposable {
    return this._menuRegistry.contributeMenu(location, factoryFn, options ?? {});
  }
}

/**
 * Intercepts calls to the menu registry by chaining registered menu adapters.
 *
 * Each adapter can handle the call, modify it, or pass it to the next.
 */
function interceptMenuRegistry(menuRegistry: SciMenuRegistry): SciMenuRegistry {
  // TODO [Angular 22] Remove cast when Angular supports type safety for multi-injection with abstract class DI tokens. See https://github.com/angular/angular/issues/55555
  const menuAdapters = inject(SciMenuAdapter, {optional: true}) as SciMenuAdapter[] | null ?? [];

  return menuAdapters.reduceRight((next: SciMenuAdapterChain, adapter: SciMenuAdapter) => ({
      contributeMenu: (location, factoryFn, options) => adapter.contributeMenu ? adapter.contributeMenu(location, factoryFn, options, next) : next.contributeMenu(location, factoryFn, options),
      menuContributions: (location, context, options) => adapter.menuContributions ? adapter.menuContributions(location, context, options, next) : next.menuContributions(location, context, options),
      menuItems: (location, context, options) => adapter.menuItems ? adapter.menuItems(location, context, options, next) : next.menuItems(location, context, options),
      openMenu: (menu, options) => adapter.openMenu ? adapter.openMenu(menu, options, next) : next.openMenu(menu, options),
    }),
    menuRegistry,
  );
}

/**
 * Provides {@link SciMenuService} for dependency injection.
 */
export function provideMenuService(): Provider[] {
  return [
    ɵSciMenuService,
    {provide: SciMenuService, useExisting: ɵSciMenuService},
  ];
}
