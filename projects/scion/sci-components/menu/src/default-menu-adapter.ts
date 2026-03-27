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
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciMenuAdapter} from './menu-adapter';
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

@Injectable({providedIn: 'root'})
export class SciDefaultMenuAdapter implements SciMenuAdapter {

  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, WritableSignal<Array<SciMenuContribution>>>;
  private readonly _menuItemsCaches = new Map<SciMenuContribution, MenuItemsCache>;
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(locationLike: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options?: SciMenuContributionOptions): Disposable {
    const {location, scope} = parseMenuLocation(locationLike.location);
    const {before, after, position} = locationLike;

    const contribution: SciMenuContribution = {
      scope: scope,
      factoryFn: factoryFn,
      position: prune({before, after, position} as SciMenuContributionPosition, {pruneIfEmpty: true}),
      requiredContext: options?.requiredContext ?? new Map(),
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
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options?: {injector?: Injector}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuContributions, 'Call menuContributions() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    if (!options?.injector) {
      ɵassertInInjectionContext(this.menuContributions, 'Call menuContributions() in an injection context, as it may allocate resources that are not released until the injection context is destroyed.')
    }

    const callingContextInjector = options?.injector ?? inject(Injector);

    const contributions = computed(() => {
      // If no contributions are registered yet, register signal for the signal to "emit" when contributions are registered later.
      if (!this._contributions.has(location())) {
        this._contributions.set(location(), signal([]));
      }
      return this._contributions.get(location())!().filter(contribution => {
        const requiredContext = contribution.requiredContext;
        for (const [name, value] of requiredContext.entries() ?? []) {
          // Skip if the context value is `undefined`, i.e., cleared from required context.
          if (value === undefined) {
            continue;
          }

          if (!Objects.isEqual(context().get(name), value, {ignoreArrayOrder: true})) {
            return false;
          }
        }
        return true;
      });
    }, {equal: (a, b) => Objects.isEqual(a, b)});

    // Construct contribution, recursively.
    return computed(() => {
      if (!contributions().length) {
        return NULL_MENU_CONTRIBUTIONS;
      }

      return sortMenuItems(contributions()
        .flatMap((contribution: SciMenuContribution): SciMenuItemLike[] => {
          const menuItems = this._menuItemsCaches.get(contribution)!.computeIfAbsent(context(), context => {
            const injector = inject(Injector);

            return computed(() => {
              switch (contribution.scope) {
                case 'menu': {
                  const menuFactory = new ɵSciMenuFactory();
                  const menuFactoryFn = contribution.factoryFn as SciMenuFactoryFn | SciMenuGroupFactoryFn;
                  runInInjectionContext(injector, () => menuFactoryFn(menuFactory, context));
                  return menuFactory.menuItems.map(menuItem => ({...menuItem, position: contribution.position}));
                }
                case 'toolbar': {
                  const toolbarFactory = new ɵSciToolbarFactory();
                  const toolbarFactoryFn = contribution.factoryFn as SciToolbarFactoryFn | SciToolbarGroupFactoryFn;
                  runInInjectionContext(injector, () => toolbarFactoryFn(toolbarFactory, context));
                  return toolbarFactory.menuItems.map(menuItem => ({...menuItem, position: contribution.position}));
                }
              }
            });
          }, {injector: callingContextInjector, debugInfo: location()});

          return menuItems();
        })
        // Add contributions, recursively for each submenu or group.
        .map(menuItem => this.addMenuContributions(menuItem, context(), {injector: callingContextInjector}))
        // Filter empty submenus and groups.
        .flatMap(filterEmpty));
    });
  }

  private addMenuContributions(menuItem: SciMenuItemLike, context: Map<string, unknown>, options?: {injector?: Injector}): SciMenuItemLike {
    if (menuItem.type === 'menu-item') {
      return {
        ...menuItem,
        actions: menuItem.actions
          .map(action => this.addMenuContributions(action, context, options))
          .flatMap(filterEmpty),
      };
    }

    return {
      ...menuItem,
      children: sortMenuItems(menuItem.children
        .concat(menuItem.name ? untracked(() => this.menuContributions(signal(menuItem.name!), signal(context), {injector: options?.injector}))() : [])
        .map(child => this.addMenuContributions(child, context, options))),
    };
  }

  /** @inheritDoc */
  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    // Create injection context to dispose resources when closing the menu.
    const injector = createDestroyableInjector({parent: this._injector});
    const menuItems = Array.isArray(menu) ? signal(menu) : this.menuContributions(signal(menu), signal(options.context ?? new Map()), {injector});

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
