/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Binding, ComponentRef, computed, createComponent, DestroyRef, DOCUMENT, effect, ElementRef, EnvironmentInjector, inject, Injectable, Injector, inputBinding, runInInjectionContext, signal, Signal, ViewContainerRef} from '@angular/core';
import {SciMenuItemLike} from './menu.model';
import {SciMenuOptions, SciMenuOrigin, SciMenuRef} from './menu.service';
import {coerceElement} from '@angular/cdk/coercion';
import {MenuComponent} from './menu/menu.component';
import {dimension} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {NULL_MENU_CONTRIBUTIONS} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';
import {ɵSciMenuService} from '@scion/sci-components/menu';
import {coerceSignal} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

@Injectable({providedIn: 'root'})
export class SciMenuOpener {

  private readonly _injector = inject(Injector);

  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    // Create injection context to dispose resources when closing the menu.
    const injector = createDestroyableInjector({parent: this._injector});
    const menuItems = Array.isArray(menu) ? signal(menu) : this.menuService.menuItems(menu, options.context ?? new Map(), {injector, metadata: options.metadata});

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

  /**
   * Reference to the menu service.
   *
   * - Do not inject during construction to prevent injection cycle.
   * - Do not use {@link SciMenuRegistry} to proxy calls through the adapter chain.
   */
  private get menuService(): ɵSciMenuService {
    return this._injector.get(ɵSciMenuService);
  }

  private createMenuPopover(menuItems: Signal<SciMenuItemLike[]>, anchorElement: HTMLElement, options: SciMenuOptions): ComponentRef<MenuComponent> {
    const anchorSize = dimension(anchorElement);
    const bindings: Binding[] = [
      inputBinding('type', signal('menu')),
      inputBinding('menuItems', menuItems),
      inputBinding('filter', signal(coerceFilterDescriptor(options.filter))),
      inputBinding('sizeInput', signal(options.size)),
      inputBinding('sizeInput', signal(options.size)),
      inputBinding('anchorWidth', computed(() => options.align === 'vertical' ? anchorSize().offsetWidth : undefined)),
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
        'position-try-fallbacks': 'flip-inline, flip-block, flip-inline flip-block',
        'top': `calc(anchor(top) - var(--ɵsci-menu-padding-block))`,
        'left': 'calc(anchor(right) + 1px)',
      });
    }
    else {
      setStyles(popoverElement, {
        'position-anchor': `--${popoverId}`,
        'position-try-fallbacks': 'flip-block',
        'position-area': 'bottom right', // to not push popover out of the page viewport
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

function coerceFilterDescriptor(filter: SciMenuOptions['filter'] | undefined): {placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>} | undefined {
  if (typeof filter === 'object') {
    return {
      placeholder: coerceSignal(filter.placeholder),
      notFoundText: coerceSignal(filter.notFoundText),
    };
  }
  return filter === true ? {} : undefined;
}
