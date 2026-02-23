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
import {Maps, Objects} from '@scion/toolkit/util';
import {ɵSciMenuFactory} from './menu/ɵmenu.factory';
import {ɵSciToolbarFactory} from './toolbar/ɵtoolbar.factory';
import {sortMenuItems} from './menu-item-sorter';
import {NULL_MENU_CONTRIBUTIONS, SciMenubarFactoryFn, SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuContributionPositionLike, SciMenuFactoryFn, SciMenuFactoryFnLike, SciToolbarFactoryFn} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';
import {ɵassertInInjectionContext} from './common/common';
import {prune} from './common/prune.util';
import {parseMenuLocation} from './menu-location-parser';
import {SciMenuAdapter} from './menu-adapter.model';
import {SciMenuContributionInstantProvider} from './menu-contribution-instant.provider';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuOpener} from './menu-opener.service';
import {SciMenuEnvironmentProviders} from './environment/menu-environment-providers';
import {ɵSciMenubarFactory} from './menubar/ɵmenubar.factory';
import {collectAccelerators, SciKeyboardAccelerator} from './menu-accelerators';

@Injectable({providedIn: 'root'})
export class ɵSciMenuRegistry implements SciMenuRegistry, SciMenuAdapter {

  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `menubar:${string}`, WritableSignal<Array<SciMenuContribution>>>;
  private readonly _menuItemsCache = new MenuItemsCache();
  private readonly _contributionInstantProvider = inject(SciMenuContributionInstantProvider);
  private readonly _menuOpener = inject(SciMenuOpener);
  private readonly _injector = inject(Injector);
  private readonly _menuContextProviders = inject(SciMenuEnvironmentProviders);

  /** @inheritDoc */
  public contributeMenu(locationLike: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable {
    const {scope, location} = parseMenuLocation(locationLike.location);
    const {before, after, position} = locationLike;

    const contribution: SciMenuContribution = {
      scope: scope,
      factoryFn: factoryFn,
      position: prune({before, after, position} as SciMenuContributionPositionLike, {pruneIfEmpty: true}),
      requiredContext: options.requiredContext ?? new Map(),
      contributionInstant: options.contributionInstant ?? this._contributionInstantProvider.next(),
      metadata: options.metadata ?? {},
    }

    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }

    this._contributions.get(location)!.update(contributions => contributions.concat(contribution));

    return {
      dispose: () => {
        // Do not remove signal for listener to never have a "stale" signal.
        this._contributions.get(location)!.update(contributions => contributions.filter(it => it !== contribution));

        this._menuItemsCache.dispose(contribution);
      },
    }
  }

  /** @inheritDoc */
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `menubar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuContribution[]> {
    return computed(() => {
      // Ensure the location is tracked for later registrations.
      if (!this._contributions.has(location())) {
        this._contributions.set(location(), signal([]));
      }
      const contributions = this._contributions.get(location())!();
      const environmentContext = context();

      return untracked(() => contributions
        // Filter contributions not matching the environment context.
        .filter(contribution => {
          const requiredContext = contribution.requiredContext;
          for (const [name, value] of requiredContext.entries() ?? []) {
            // Skip check if the required context value has been cleared.
            if (value === undefined) {
              continue;
            }

            // Only include contributions matching the environment context.
            if (!Objects.isEqual(environmentContext.get(name), value, {ignoreArrayOrder: true})) {
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
  public menuItems(location: Signal<`menu:${string}` | `toolbar:${string}` | `menubar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuItems, 'Call menuItems() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    if (!options.injector) {
      ɵassertInInjectionContext(this.menuItems, 'Call menuItems() in an injection context, as it may allocate resources that are not released until the injection context is destroyed.')
    }

    const callingContextInjector = options.injector ?? inject(Injector);
    const menuService = this.menuService;
    const menuItemsCache = this._menuItemsCache;
    const menuContextProviders = this._menuContextProviders;

    // Get contributions for this location.
    const menuContributions = menuService.menuContributions(location, context, options);

    // Construct menu items from contributions, recursively.
    return computed(() => {
      if (!menuContributions().length) {
        return NULL_MENU_CONTRIBUTIONS;
      }
      const callingContext = context();
      const menuItems = menuContributions()
        // Construct menu items for each contribution in this context.
        .flatMap(menuContribution => untracked(() => computeMenuItems(menuContribution, callingContext))())
        // Federate menu items, recursively for each submenu and group.
        .map(menuItem => untracked(() => federateMenu(menuItem, callingContext, {injector: callingContextInjector, metadata: options.metadata}))())
        // Filter empty submenus and groups.
        .flatMap(filterEmpty);

      return sortMenuItems(menuItems);
    });

    /**
     * Computes the menu items of given contribution based on given context.
     */
    function computeMenuItems(menuContribution: SciMenuContribution, context: Map<string, unknown>): Signal<SciMenuItemLike[]> {
      assertNotInReactiveContext(computeMenuItems, 'Call computeMenuItems() in a non-reactive (non-tracking) context, such as within the untracked() function.');

      return menuItemsCache.computeIfAbsent(menuContribution, context, () => {
        const injector = createDestroyableInjector({
          parent: inject(Injector),
          providers: menuContextProviders.provideInjectionContext(context),
        });

        return computed(() => {
          switch (menuContribution.scope) {
            case 'menu': {
              const menuFactory = new ɵSciMenuFactory();
              const menuFactoryFn = menuContribution.factoryFn as SciMenuFactoryFn;
              runInInjectionContext(injector, () => menuFactoryFn(menuFactory, context));
              return menuFactory.menuItems.map(menuItem => ({...menuItem, position: menuContribution.position}));
            }
            case 'toolbar': {
              const toolbarFactory = new ɵSciToolbarFactory();
              const toolbarFactoryFn = menuContribution.factoryFn as SciToolbarFactoryFn;
              runInInjectionContext(injector, () => toolbarFactoryFn(toolbarFactory, context));
              return toolbarFactory.menuItems.map(menuItem => ({...menuItem, position: menuContribution.position}));
            }
            case 'menubar': {
              const menubarFactory = new ɵSciMenubarFactory();
              const menubarFactoryFn = menuContribution.factoryFn as SciMenubarFactoryFn;
              runInInjectionContext(injector, () => menubarFactoryFn(menubarFactory, context));
              return menubarFactory.menuItems.map(menuItem => ({...menuItem, position: menuContribution.position}));
            }
          }
        });
      }, {injector: callingContextInjector})
    }

    /**
     * Federates passed menu or group with contributions based on its name. Federation is recursive.
     */
    function federateMenu(menuItem: SciMenuItemLike, context: Map<string, unknown>, options?: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike> {
      assertNotInReactiveContext(federateMenu, 'Call federateMenu() in a non-reactive (non-tracking) context, such as within the untracked() function.');

      const contributions = menuItem.name && menuItem.type !== 'menu-item' ? menuService.menuItems(menuItem.name, context, options) : signal([]);

      return computed((): SciMenuItemLike => {
        const federatedItem = {...menuItem};

        if ('children' in federatedItem) {
          federatedItem.children = sortMenuItems(federatedItem.children.concat(contributions()).map(child => untracked(() => federateMenu(child, context, options))()));
        }

        if ('actions' in federatedItem && federatedItem.actions) {
          federatedItem.actions = federatedItem.actions.map(action => untracked(() => federateMenu(action, context, options))()).flatMap(filterEmpty);
        }

        return federatedItem;
      });
    }
  }

  /** @inheritDoc */
  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    return this._menuOpener.openMenu(menu, options);
  }

  /** @inheritDoc */
  public accelerators(context: Signal<Map<string, unknown>>): Signal<SciKeyboardAccelerator[]> {
    return this._menuItemsCache.accelerators(context);
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

  private readonly _cache = signal(new Set<CacheEntry>());
  private readonly _cacheByContribution = computed(() => {
    return Array.from(this._cache()).reduce((map, cacheEntry) => Maps.addListValue(map, cacheEntry.contribution, cacheEntry), new Map<SciMenuContribution, CacheEntry[]>());
  });

  public computeIfAbsent(contribution: SciMenuContribution, context: Map<string, unknown>, computeFn: () => Signal<SciMenuItemLike[]>, options?: {injector?: Injector}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.computeIfAbsent, 'Call computeIfAbsent() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    const injector = options?.injector ?? inject(Injector);

    const cacheEntry = this._cacheByContribution().get(contribution)?.find(cacheEntry => Objects.isEqual(cacheEntry.context, context)) ?? (() => {
      const cacheEntryInjector = createDestroyableInjector({parent: injector.get(ApplicationRef).injector});
      const cacheEntry: CacheEntry = {
        injector: cacheEntryInjector,
        contribution,
        menuItems: runInInjectionContext(cacheEntryInjector, () => computeFn()),
        context,
        refCount: 0,
        dispose: () => cacheEntryInjector.destroy(),
      };
      this._cache.update(cache => new Set(cache).add(cacheEntry));
      return cacheEntry;
    })();

    cacheEntry.refCount++;

    // Decrement ref count if calling context is destroyed.
    injector.get(DestroyRef).onDestroy(() => {
      if (--cacheEntry.refCount === 0) {
        cacheEntry.dispose();
        this._cache.update(cache => {
          const cacheCopy = new Set(cache);
          cacheCopy.delete(cacheEntry)
          return cacheCopy;
        });
      }
    });

    return cacheEntry.menuItems;
  }

  /**
   * Gets accelerators of currently used menu items, optionally filtered by context.
   *
   * An accelerator matches if its menu item's context is the same as, a subset of, or has extra values compared to the given context. It never matches if a context value is different.
   *
   * IMPORTANT: Unlike {@link computeIfAbsent}, this method is based on currently used menu items, not available contributions.
   * If a contribution is not used in the application, its accelerators are not returned.
   */
  public accelerators(context: Signal<Map<string, unknown>>): Signal<SciKeyboardAccelerator[]> {
    return computed(() => {
      return Array.from(this._cache().values())
        // Filter by context.
        .filter(cacheEntry => {
          for (const [name, value] of context().entries() ?? []) {
            // Skip check if the context value has been cleared.
            if (value === undefined) {
              continue;
            }

            // Match if the menu item's context is the same as, a subset of, or has extra values compared to the given context.
            // Never match if a context value is different.
            if (cacheEntry.context.has(name) && !Objects.isEqual(cacheEntry.context.get(name), value, {ignoreArrayOrder: true})) {
              return false;
            }
          }
          return true;
        })
        .flatMap(cacheEntry => collectAccelerators(cacheEntry.menuItems()))
        // Remove duplicate accelerators.
        .reduce((accelerators, menuItem) => {
          if (!accelerators.some(accelerator => Objects.isEqual(accelerator, menuItem.accelerator!, {ignoreArrayOrder: true}))) {
            return [...accelerators, menuItem.accelerator!];
          }
          return accelerators;
        }, new Array<SciKeyboardAccelerator>());
    }, {equal: (a, b) => Objects.isEqual(a, b, {ignoreArrayOrder: true})});
  }

  public dispose(contribution: SciMenuContribution): void {
    assertNotInReactiveContext(this.dispose, 'Call dispose() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    const cacheEntriesToRemove = this._cacheByContribution().get(contribution) ?? [];
    this._cache.update(cache => {
      const cacheCopy = new Set(cache);

      cacheEntriesToRemove.forEach(cacheEntry => {
        cacheEntry.dispose();
        cacheCopy.delete(cacheEntry);
      });

      return cacheCopy;
    });
  }
}

export interface CacheEntry {
  contribution: SciMenuContribution;
  context: Map<string, unknown>;
  injector: DestroyableInjector;
  menuItems: Signal<SciMenuItemLike[]>;
  refCount: number;
  dispose: () => void;
}
