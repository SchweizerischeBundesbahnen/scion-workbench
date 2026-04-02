/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, assertNotInReactiveContext, computed, DestroyableInjector, DestroyRef, inject, Injectable, Injector, runInInjectionContext, signal, Signal, untracked, WritableSignal} from '@angular/core';
import {SciMenuRegistry} from './menu.registry';
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciMenuOptions, SciMenuRef} from './menu.service';
import {Objects} from '@scion/toolkit/util';
import {ɵSciMenuFactory} from './menu/ɵmenu.factory';
import {ɵSciToolbarFactory} from './toolbar/ɵtoolbar.factory';
import {sortMenuItems} from './menu-item-sorter';
import {NULL_MENU_CONTRIBUTIONS, SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuContributionPosition, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuGroupFactoryFn, SciToolbarFactoryFn, SciToolbarGroupFactoryFn} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';
import {ɵassertInInjectionContext} from './common/common';
import {prune} from './common/prune.util';
import {parseMenuLocation} from './menu-location-parser';
import {SciMenuAdapter} from './menu-adapter.model';
import {SciMenuContributionInstantProvider} from './menu-contribution-instant.provider';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuOpener} from './menu-opener.service';

@Injectable({providedIn: 'root'})
export class ɵSciMenuRegistry implements SciMenuRegistry, SciMenuAdapter {

  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, WritableSignal<Array<SciMenuContribution>>>;
  private readonly _menuItemsCaches = new Map<SciMenuContribution, MenuItemsCache>;
  private readonly _contributionInstantProvider = inject(SciMenuContributionInstantProvider);
  private readonly _menuOpener = inject(SciMenuOpener);
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(locationLike: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable {
    const {location, scope} = parseMenuLocation(locationLike.location);
    const {before, after, position} = locationLike;

    const contribution: SciMenuContribution = {
      scope: scope,
      factoryFn: factoryFn,
      position: prune({before, after, position} as SciMenuContributionPosition, {pruneIfEmpty: true}),
      requiredContext: options.requiredContext ?? new Map(),
      contributionInstant: options.contributionInstant ?? this._contributionInstantProvider.next(),
      metadata: options.metadata ?? {},
    }

    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }

    this._contributions.get(location)!.update(contributions => contributions.concat(contribution));
    this._menuItemsCaches.set(contribution, new MenuItemsCache());

    return {
      dispose: () => {
        // Do not remove signal for listener to never have a "stale" signal.
        this._contributions.get(location)!.update(contributions => contributions.filter(it => it !== contribution));
        this._menuItemsCaches.get(contribution)!.dispose();
        this._menuItemsCaches.delete(contribution);
      },
    }
  }

  /** @inheritDoc */
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuContribution[]> {
    return computed(() => {
      // Ensure the location is tracked for later registrations.
      if (!this._contributions.has(location())) {
        this._contributions.set(location(), signal([]));
      }
      const contributions = this._contributions.get(location())!();

      return untracked(() => contributions
        // Filter contributions not matching the calling context.
        .filter(contribution => {
          const requiredContext = contribution.requiredContext;
          for (const [name, value] of requiredContext.entries() ?? []) {
            // Skip check if the required context value has been cleared.
            if (value === undefined) {
              continue;
            }

            // Only include contributions matching the calling context.
            if (!Objects.isEqual(context().get(name), value, {ignoreArrayOrder: true})) {
              return false;
            }
          }
          return true;
        })
        // Sort contributions by contribution instant.
        .sort((a, b) => a.contributionInstant - b.contributionInstant),
      );
    }, {equal: (a, b) => Objects.isEqual(a, b)});
  }

  /** @inheritDoc */
  public menuItems(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuItems, 'Call menuItems() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    if (!options.injector) {
      ɵassertInInjectionContext(this.menuItems, 'Call menuItems() in an injection context, as it may allocate resources that are not released until the injection context is destroyed.')
    }

    const callingContextInjector = options.injector ?? inject(Injector);
    const menuService = this.menuService;
    const menuContributions = menuService.menuContributions(location, context, options);

    // Construct contribution, recursively.
    return computed(() => {
      if (!menuContributions().length) {
        return NULL_MENU_CONTRIBUTIONS;
      }

      return sortMenuItems(menuContributions()
        .flatMap((menuContribution: SciMenuContribution): SciMenuItemLike[] => {
          const menuItems = this._menuItemsCaches.get(menuContribution)!.computeIfAbsent(context(), context => {
            const injector = inject(Injector);

            return computed(() => {
              switch (menuContribution.scope) {
                case 'menu': {
                  const menuFactory = new ɵSciMenuFactory();
                  const menuFactoryFn = menuContribution.factoryFn as SciMenuFactoryFn | SciMenuGroupFactoryFn;
                  runInInjectionContext(injector, () => menuFactoryFn(menuFactory, context));
                  return menuFactory.menuItems.map(menuItem => ({...menuItem, position: menuContribution.position}));
                }
                case 'toolbar': {
                  const toolbarFactory = new ɵSciToolbarFactory();
                  const toolbarFactoryFn = menuContribution.factoryFn as SciToolbarFactoryFn | SciToolbarGroupFactoryFn;
                  runInInjectionContext(injector, () => toolbarFactoryFn(toolbarFactory, context));
                  return toolbarFactory.menuItems.map(menuItem => ({...menuItem, position: menuContribution.position}));
                }
              }
            });
          }, {injector: callingContextInjector, debugInfo: location()});

          return menuItems();
        })
        // Add contributions, recursively for each submenu or group.
        .map(menuItem => federateMenu(menuItem, context(), {injector: callingContextInjector, metadata: options.metadata}))
        // Filter empty submenus and groups.
        .flatMap(filterEmpty))
    });

    /**
     * Federates passed menu or group with contributions based on its name. Federation is recursive.
     */
    function federateMenu(menuItem: SciMenuItemLike, context: Map<string, unknown>, options?: {injector?: Injector; metadata?: {[key: string]: unknown}}): SciMenuItemLike {
      if (menuItem.type === 'menu-item') {
        return {
          ...menuItem,
          actions: menuItem.actions
            .map(action => federateMenu(action, context, options))
            .flatMap(filterEmpty),
        };
      }

      const contributions = menuItem.name ? untracked(() => menuService.menuItems(menuItem.name!, context, {injector: options?.injector, metadata: options?.metadata}))() : [];
      return {
        ...menuItem,
        children: sortMenuItems(menuItem.children.concat(contributions).map(child => federateMenu(child, context, options))),
      };
    }
  }

  /** @inheritDoc */
  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    return this._menuOpener.openMenu(menu, options);
  }

  /**
   * Reference to the menu service.
   *
   * Use to call methods like {@link ɵSciMenuService.menuContributions} or {@link ɵSciMenuService.menuItems} through the adapter chain.
   */
  private get menuService(): ɵSciMenuService {
    return this._injector.get(ɵSciMenuService);
  }
}

function filterEmpty(menuItem: SciMenuItemLike): [SciMenuItemLike] | [] {
  switch (menuItem.type) {
    case 'menu-item':
      return [menuItem];
    case 'menu':
    case 'group':
      const children = menuItem.children.flatMap(filterEmpty);
      if (!children.length) {
        return [];
      }
      return [{...menuItem, children}];
  }
}

class MenuItemsCache {

  private readonly _cache = new Array<{context: Map<string, unknown>, cacheEntry: CacheEntry}>;

  public computeIfAbsent(context: Map<string, unknown>, computeFn: (context: Map<string, unknown>) => Signal<SciMenuItemLike[]>, options?: {injector?: Injector; debugInfo?: string}): Signal<SciMenuItemLike[]> {
    const injector = options?.injector ?? inject(Injector);

    const cacheEntry = this._cache.find(entry => Objects.isEqual(entry.context, context))?.cacheEntry ?? (() => {
      const cacheEntryInjector = createDestroyableInjector({parent: injector.get(ApplicationRef).injector});
      const cacheEntry: CacheEntry = {
        injector: cacheEntryInjector,
        menuItems: runInInjectionContext(cacheEntryInjector, () => computeFn(context)),
        refCount: 0,
        dispose: () => cacheEntryInjector.destroy(),
      };
      this._cache.push({context, cacheEntry});
      return cacheEntry;
    })();

    cacheEntry.refCount++;

    // Decrement ref count if calling context is destroyed.
    injector.get(DestroyRef).onDestroy(() => {
      if (--cacheEntry.refCount === 0) {
        cacheEntry.dispose();
        const index = this._cache.findIndex(cacheEntry => Objects.isEqual(cacheEntry.context, context));
        this._cache.splice(index, 1);
      }
    });

    return cacheEntry.menuItems;
  }

  public dispose(): void {
    for (const {cacheEntry} of this._cache.values()) {
      cacheEntry.dispose();
    }
    this._cache.length = 0;
  }
}

export interface CacheEntry {
  injector: DestroyableInjector;
  menuItems: Signal<SciMenuItemLike[]>;
  refCount: number;
  dispose: () => void;
}
