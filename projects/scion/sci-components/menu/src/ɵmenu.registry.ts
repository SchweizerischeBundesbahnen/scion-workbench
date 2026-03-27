/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, assertNotInReactiveContext, Binding, ComponentRef, computed, createComponent, DestroyableInjector, DestroyRef, DOCUMENT, effect, ElementRef, EnvironmentInjector, inject, Injectable, Injector, inputBinding, runInInjectionContext, signal, Signal, untracked, ViewContainerRef, WritableSignal} from '@angular/core';
import {SciMenuRegistry} from './menu.registry';
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciMenuOptions, SciMenuOrigin, SciMenuRef} from './menu.service';
import {coerceElement} from '@angular/cdk/coercion';
import {MenuComponent} from './menu/menu.component';
import {dimension} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {Objects} from '@scion/toolkit/util';
import {ɵSciMenuFactory} from './menu/ɵmenu.factory';
import {ɵSciToolbarFactory} from './toolbar/ɵtoolbar.factory';
import {sortMenuItems} from './menu-item-sorter';
import {NULL_MENU_CONTRIBUTIONS, SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuContributionPosition, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuGroupFactoryFn, SciToolbarFactoryFn, SciToolbarGroupFactoryFn} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';
import {ɵassertInInjectionContext} from './common/common';
import {prune} from './common/prune.util';
import {parseMenuLocation} from './menu-location-parser';
import {SciMenuAdapter, SciMenuAdapterChain} from './menu-adapter.model';
import {SciMenuContributionInstantProvider} from './menu-contribution-instant.provider';

@Injectable({providedIn: 'root'})
export class ɵSciMenuRegistry implements SciMenuRegistry, SciMenuAdapter {

  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, WritableSignal<Array<SciMenuContribution>>>;
  private readonly _menuItemsCaches = new Map<SciMenuContribution, MenuItemsCache>;
  private readonly _contributionInstantProvider = inject(SciMenuContributionInstantProvider);
  private readonly _injector = inject(Injector);
  /** Internal reference to this registry that proxies calls through the menu adapter chain. Use for internal method calls. */
  private readonly _proxy = interceptMenuRegistry(this);

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
    const menuContributions = this._proxy.menuContributions(location, context, options);
    const proxy = this._proxy;

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
        .map(menuItem => addMenuContributions(menuItem, context(), {injector: callingContextInjector, metadata: options.metadata}))
        // Filter empty submenus and groups.
        .flatMap(filterEmpty));
    });

    function addMenuContributions(menuItem: SciMenuItemLike, context: Map<string, unknown>, options?: {injector?: Injector; metadata?: {[key: string]: unknown}}): SciMenuItemLike {
      if (menuItem.type === 'menu-item') {
        return {
          ...menuItem,
          actions: menuItem.actions
            .map(action => addMenuContributions(action, context, options))
            .flatMap(filterEmpty),
        };
      }

      return {
        ...menuItem,
        children: sortMenuItems(menuItem.children
          .concat(menuItem.name ? untracked(() => proxy.menuItems(signal(menuItem.name!), signal(context), {injector: options?.injector, metadata: options?.metadata}))() : [])
          .map(child => addMenuContributions(child, context, options))),
      };
    }
  }

  /** @inheritDoc */
  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    // Create injection context to dispose resources when closing the menu.
    const injector = createDestroyableInjector({parent: this._injector});
    const menuItems = Array.isArray(menu) ? signal(menu) : this._proxy.menuItems(signal(menu), signal(options.context ?? new Map()), {injector, metadata: options.metadata});

    return runInInjectionContext(injector, () => {
      // Get or create anchor at specified origin.
      const anchorElement = options.anchor instanceof ElementRef || options.anchor instanceof HTMLElement ? coerceElement(options.anchor) : this.createVirtualAnchor(options.anchor, {viewContainerRef: options.viewContainerRef});

      // Create menu popover.
      const componentRef = this.createMenuPopover(menuItems, anchorElement, options);
      componentRef.onDestroy(() => injector.destroy());

      return {
        close: () => componentRef.destroy(),
        onClose: onClose => componentRef.hostView.destroyed ? onClose() : componentRef.onDestroy(onClose), // Call callback immediately if already destroyed.
      };
    });
  }

  private createMenuPopover(menuItems: Signal<SciMenuItemLike[]>, anchorElement: HTMLElement, options: SciMenuOptions): ComponentRef<MenuComponent> {
    const anchorSize = dimension(anchorElement);
    const bindings: Binding[] = [
      inputBinding('type', signal('menu')),
      inputBinding('menuItems', menuItems),
      inputBinding('filter', signal(options.filter)),
      inputBinding('sizeInput', signal(options.size)),
      inputBinding('anchorWidth', computed(() => anchorSize().offsetWidth)),
      inputBinding('cssClass', signal(options.cssClass)),
    ];

    // Create menu component and attach it to the DOM.
    const componentRef = (() => {
      if (options.viewContainerRef) {
        return options.viewContainerRef.createComponent(MenuComponent, {bindings});
      }
      else {
        const popoverElement = inject(DOCUMENT).createElement('sci-menu');
        const componentRef = createComponent(MenuComponent, {
          environmentInjector: inject(EnvironmentInjector),
          hostElement: popoverElement, // is removed when destroying the component
          bindings,
        });

        // Insert popover after the anchor node.
        anchorElement.after(popoverElement);

        // Attach component to include in change detection.
        inject(ApplicationRef).attachView(componentRef.hostView);

        return componentRef;
      }
    })();

    // Bind popover to anchor.
    const popoverElement = componentRef.location.nativeElement as HTMLElement;
    this.bindPopoverToAnchor({popoverElement, anchorElement, align: options.align ?? 'vertical'});

    // Destroy component when closing the popover.
    popoverElement.addEventListener('toggle', (event: ToggleEvent): void => {
      if (event.newState === 'closed') {
        componentRef.destroy();
      }
    });

    // Run change detection.
    componentRef.changeDetectorRef.detectChanges();

    // Show popover.
    popoverElement.showPopover();

    // Focus popover and delay display until menu items.
    this.focusAndDelayPopover(menuItems, popoverElement, {focus: options.focus ?? true});

    return componentRef;
  }

  /**
   * TODO [menu] Find better name.
   */
  private focusAndDelayPopover(menuItems: Signal<SciMenuItemLike[]>, popoverElement: HTMLElement, options: {focus: boolean}): void {
    if (!menuItems().length && menuItems() !== NULL_MENU_CONTRIBUTIONS) {
      setStyles(popoverElement, {'display': 'none'});

      effect(() => {
        if (menuItems().length) {
          setStyles(popoverElement, {'display': null});

          if (options.focus) {
            setAttributes(popoverElement, {'tabindex': '-1'});
            popoverElement.focus();
          }
        }
      });
    }
    else if (options.focus) {
      setAttributes(popoverElement, {'tabindex': '-1'});
      popoverElement.focus();
    }
  }

  private bindPopoverToAnchor(binding: {popoverElement: HTMLElement, anchorElement: HTMLElement, align: 'vertical' | 'horizontal'}): void {
    const {popoverElement, anchorElement, align} = binding;
    const popoverId = `scimenu-${UUID.randomUUID().substring(0, 8)}`;

    // Connect anchor to popover.
    setAttributes(anchorElement, {
      'popovertarget': popoverId,
      'popovertargetaction': 'show',
    });

    setStyles(anchorElement, {
      'anchor-name': `--${popoverId}`,
    });

    // Connect popover to anchor.
    setAttributes(popoverElement, {
      'id': popoverId,
      'popover': 'auto',
    });

    if (align === 'horizontal') {
      setStyles(popoverElement, {
        'position-anchor': `--${popoverId}`,
        'position-try-fallbacks': 'flip-inline, flip-block',
        'top': `calc(anchor(top) - var(--ɵsci-menu-padding))`,
        'left': 'calc(anchor(right) + 1px)',
      });
    }
    else {
      setStyles(popoverElement, {
        'position-anchor': `--${popoverId}`,
        'position-try-fallbacks': 'flip-inline, flip-block',
        'top': 'calc(anchor(bottom) + 1px)',
        'left': 'anchor(left)',
      });
    }

    // Remove attributes and styles from the anchor element when the popover is closed.
    // No clean up is required for the popover element because it is destroyed when closed.
    inject(DestroyRef).onDestroy(() => {
      setAttributes(anchorElement, {
        'popovertarget': null,
        'popovertargetaction': null,
      });
      setStyles(anchorElement, {
        'anchor-name': null,
      })
    });
  }

  private createVirtualAnchor(anchor: MouseEvent | SciMenuOrigin, options: {viewContainerRef?: ViewContainerRef}): HTMLElement {
    // Coerce coordinates.
    const {x, y, width, height} = anchor instanceof MouseEvent ? ({x: anchor.x, y: anchor.y}) : anchor;

    // Create virtual anchor element at anchor bounds.
    const virtualAnchorElement = inject(DOCUMENT).createElement('div');
    inject(DestroyRef).onDestroy(() => virtualAnchorElement.remove());

    // Position the anchor element.
    setStyles(virtualAnchorElement, {
      'position': 'fixed',
      'left': `${x}px`,
      'top': `${y}px`,
      'width': width ? `${width}px` : '0',
      'height': height ? `${height}px` : '0',
      'pointer-events': 'none',
    });

    // Attach the anchor element to the DOM.
    if (options?.viewContainerRef) {
      coerceElement(options?.viewContainerRef.element).after(virtualAnchorElement);
    }
    else {
      inject(DOCUMENT).body.appendChild(virtualAnchorElement);
    }

    return virtualAnchorElement;
  }
}

function setAttributes(element: HTMLElement, attributes: {[name: string]: string | null}): void {
  Object.entries(attributes).forEach(([name, value]) => {
    if (value === null) {
      element.removeAttribute(name);
    }
    else {
      element.setAttribute(name, value);
    }
  });
}

function setStyles(element: HTMLElement, styles: {[style: string]: string | null}): void {
  Object.entries(styles ?? {}).forEach(([name, value]) => {
    if (value === null) {
      element.style.removeProperty(name);
    }
    else {
      element.style.setProperty(name, value);
    }
  });
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

/**
 * Intercepts calls to the menu registry by chaining registered menu adapters.
 *
 * Each adapter can handle the call, modify it, or pass it to the next.
 */
export function interceptMenuRegistry(menuRegistry: SciMenuRegistry): SciMenuRegistry {
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
