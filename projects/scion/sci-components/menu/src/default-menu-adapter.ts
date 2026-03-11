/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Binding, ComponentRef, computed, createComponent, DestroyRef, DOCUMENT, ElementRef, EnvironmentInjector, inject, Injectable, Injector, inputBinding, runInInjectionContext, signal, Signal, ViewContainerRef, WritableSignal} from '@angular/core';
import {Disposable} from './common/disposable';
import {SciMenuItemLike} from './menu.model';
import {SciMenuAdapter} from './menu-adapter';
import {SciMenuOptions, SciMenuOrigin, SciMenuRef} from './menu.service';
import {coerceElement} from '@angular/cdk/coercion';
import {MenuComponent} from './menu/menu.component';
import {dimension} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {Objects} from '@scion/toolkit/util';
import {SciMenuFactory} from './menu/menu.factory';
import {ɵSciMenuFactory} from './menu/ɵmenu.factory';
import {ɵSciToolbarFactory} from './toolbar/ɵtoolbar.factory';
import {sortMenuItems} from './menu-item-sorter';
import {SciToolbarFactory} from './toolbar/toolbar.factory';
import {SciMenuContribution, SciToolbarContribution} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';

@Injectable({providedIn: 'root'})
export class SciDefaultMenuAdapter implements SciMenuAdapter {

  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, WritableSignal<Array<SciMenuContribution | SciToolbarContribution>>>;

  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): Disposable {
    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }

    this._contributions.get(location)!.update(contributions => contributions.concat(contribution));

    return {
      dispose: () => {
        // Do not remove signal for listener to never have a "stale" signal.
        this._contributions.get(location)!.update(contributions => contributions.filter(it => it !== contribution));
      },
    }
  }

  /** @inheritDoc */
  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Signal<SciMenuItemLike[]> {
    // If no contributions are registered yet, register signal for the signal to "emit" when contributions are registered later.
    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }
    const contributions = this._contributions.get(location)!;

    return computed(() => sortMenuItems(contributions()
      // Check if context matches
      .filter(contribution => {
        const requiredContext = contribution.requiredContext;
        for (const [name, value] of requiredContext.entries() ?? []) {
          if (!Objects.isEqual(context.get(name), value, {ignoreArrayOrder: true})) {
            return false;
          }
        }
        return true;
      })
      // Construct contribution, recursively.
      .flatMap((contribution: SciMenuContribution | SciToolbarContribution): SciMenuItemLike[] => {
        if (contribution.scope === 'menu') {
          const factoryFn: ((menu: SciMenuFactory, context: Map<string, unknown>) => void) = contribution.factory;
          const menuFactory = new ɵSciMenuFactory();
          runInInjectionContext(this._injector, () => factoryFn(menuFactory, context));
          return menuFactory.menuItems.map(menuItem => ({...menuItem, position: contribution.position}));
        }
        if (contribution.scope === 'toolbar') {
          const factoryFn: (toolbar: SciToolbarFactory, context: Map<string, unknown>) => void = contribution.factory;
          const toolbarFactory = new ɵSciToolbarFactory();
          runInInjectionContext(this._injector, () => factoryFn(toolbarFactory, context));
          return toolbarFactory.menuItems.map(menuItem => ({...menuItem, position: contribution.position}));
        }

        throw Error(`Unsupported location '${location}'. Location must start with 'menu:', 'toolbar:', or 'group(menu|toolbar):'.`);
      })
      // Add other contributions recursively.
      .map(menuItem => this.addMenuContributions(menuItem, context))
      // Filter empty groups and menus
      .flatMap(filterEmpty),
    ), {equal: Objects.isEqual});
  }

  private addMenuContributions(menuItem: SciMenuItemLike, context: Map<string, unknown>): SciMenuItemLike {
    if (menuItem.type === 'menu-item') {
      return {
        ...menuItem,
        actions: menuItem.actions
          .map(action => this.addMenuContributions(action, context))
          .flatMap(filterEmpty),
      };
    }

    return {
      ...menuItem,
      children: sortMenuItems(menuItem.children
        .concat(menuItem.name ? this.menuContributions(menuItem.name, context)() : [])
        .map(child => this.addMenuContributions(child, context))),
    };
  }

  /** @inheritDoc */
  public openMenu(menuItems: SciMenuItemLike[], options: Omit<SciMenuOptions, 'context'>): SciMenuRef {
    // Create injection context to dispose resources when closing the menu.
    const injector = createDestroyableInjector({parent: this._injector});

    return runInInjectionContext(injector, () => {
      // Get or create anchor at specified origin.
      const anchorElement = options.anchor instanceof ElementRef || options.anchor instanceof HTMLElement ? coerceElement(options.anchor) : this.createVirtualAnchor(options.anchor, {viewContainerRef: options.viewContainerRef});

      // Create menu popover.
      try {
        const componentRef = this.createMenuPopover(menuItems, anchorElement, options);
        componentRef.onDestroy(() => injector.destroy());

        return {
          close: () => componentRef.destroy(),
          onClose: onClose => componentRef.hostView.destroyed ? onClose() : componentRef.onDestroy(onClose), // Call callback immediately if already destroyed.
        };
      }
      catch (error) {
        injector.destroy();
        throw error;
      }
    });
  }

  private createMenuPopover(menuItems: SciMenuItemLike[], anchorElement: HTMLElement, options: Omit<SciMenuOptions, 'context'>): ComponentRef<MenuComponent> {
    const anchorSize = dimension(anchorElement);
    const bindings: Binding[] = [
      inputBinding('menuItems', signal(menuItems)),
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

    return componentRef;
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
