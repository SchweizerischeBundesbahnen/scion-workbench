/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, inject, Injectable, Injector, isSignal, NgZone, runInInjectionContext, Signal, untracked} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewMenuComponent} from './view-menu.component';
import {WorkbenchMenuItem} from '../../workbench.model';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {fromEvent, Subscription} from 'rxjs';
import {MenuItemConfig, WorkbenchConfig} from '../../workbench-config';
import {WorkbenchService} from '../../workbench.service';
import {subscribeIn} from '@scion/toolkit/operators';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {provideViewContext} from '../../view/view-context-provider';
import {Arrays} from '@scion/toolkit/util';
import {TextComponent} from './text/text.component';
import {coerceElement} from '@angular/cdk/coercion';
import {rootEffect} from '../../common/root-effect';

/**
 * Shows menu items of a {@link WorkbenchView} in a menu.
 */
@Injectable({providedIn: 'root'})
export class ViewMenuService {

  private static readonly TOP_LEFT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'};
  private static readonly TOP_RIGHT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top'};
  private static readonly BOTTOM_LEFT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'};
  private static readonly BOTTOM_RIGHT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _workbenchConfig = inject(WorkbenchConfig);

  constructor() {
    this.registerBuiltInMenuItems();
  }

  /**
   * Registers built-in menu items added to the context menu of every view tab.
   */
  private registerBuiltInMenuItems(): void {
    const config = this._workbenchConfig.viewMenuItems ?? {};
    if (config === false) {
      return;
    }

    this.registerCloseMenuItem(config.close ?? {});
    this.registerCloseOtherTabsMenuItem(config.closeOthers ?? {});
    this.registerCloseAllTabsMenuItem(config.closeAll ?? {});
    this.registerCloseRightTabsMenuItem(config.closeToTheRight ?? {});
    this.registerCloseLeftTabsMenuItem(config.closeToTheLeft ?? {});
    this.registerMoveRightMenuItem(config.moveRight ?? {});
    this.registerMoveLeftMenuItem(config.moveLeft ?? {});
    this.registerMoveUpMenuItem(config.moveUp ?? {});
    this.registerMoveDownMenuItem(config.moveDown ?? {});
    this.registerMoveToNewWindowMenuItem(config.moveToNewWindow ?? {});
  }

  /**
   * Shows a menu with menu items registered in given {@link WorkbenchView}.
   *
   * @see {@link WorkbenchView.registerViewMenuItem}
   */
  public async showMenu(location: Point, viewId: ViewId): Promise<boolean> {
    const view = this._viewRegistry.get(viewId);

    // Do not show the menu if there are no menu items registered.
    if (!view.menuItems().length) {
      return false;
    }

    // Prepare and display the menu overlay.
    const config = new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(location)
        .withFlexibleDimensions(false)
        .withPositions([ViewMenuService.TOP_LEFT, ViewMenuService.TOP_RIGHT, ViewMenuService.BOTTOM_LEFT, ViewMenuService.BOTTOM_RIGHT]),
    });

    const overlayRef = this._overlay.create(config);
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: OverlayRef, useValue: overlayRef},
        provideViewContext(view),
      ],
    });
    overlayRef.attach(new ComponentPortal(ViewMenuComponent, null, injector));
    return true;
  }

  /**
   * Subscribes to keyboard events for menu items of given {@link WorkbenchView} on specified element.
   *
   * This method must be passed an injector or called in an injection context. If used in a component, use the component's injector.
   * Unsubscribes from keyboard events when the injection context is destroyed.
   */
  public installMenuAccelerators(elementLike: HTMLElement | ElementRef<HTMLElement> | Signal<HTMLElement | ElementRef<HTMLElement>>, viewLike: WorkbenchView | Signal<WorkbenchView>, options?: {injector?: Injector}): void {
    const injector = options?.injector ?? inject(Injector);
    const zone = injector.get(NgZone);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(onCleanup => {
      const element = coerceElement(isSignal(elementLike) ? elementLike() : elementLike);
      const view = isSignal(viewLike) ? viewLike() : viewLike;

      untracked(() => {
        const subscription = installMenuAccelerators(element, view);
        onCleanup(() => subscription.unsubscribe());
      });
    }, {injector});

    /**
     * Subscribes to keyboard events for menu items of given {@link WorkbenchView} on specified element.
     */
    function installMenuAccelerators(element: HTMLElement, view: WorkbenchView): Subscription {
      return fromEvent<KeyboardEvent>(element, 'keydown')
        .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
        .subscribe(event => {
          const menuItems = findMatchingMenuItems(view.menuItems(), event);
          if (!menuItems.length) {
            return;
          }

          runInInjectionContext(injector, () => zone.run(() => {
            menuItems.forEach(menuItem => menuItem.onAction());
          }));

          event.preventDefault();
          event.stopPropagation();
        });
    }

    /**
     * Finds menu items that match the given keyboard event.
     */
    function findMatchingMenuItems(menuItems: WorkbenchMenuItem[], event: KeyboardEvent): WorkbenchMenuItem[] {
      const eventKey = (event.key as string | undefined)?.toLowerCase(); // `event.key` can be `undefined`, for example, when selecting an option from an input element's datalist.
      const eventModifierKeys = getModifierState(event);

      return menuItems
        .filter(menuItem => !menuItem.disabled)
        .filter(menuItem => {
          const accelerator = menuItem.accelerator;
          if (!accelerator?.length) {
            return false;
          }

          const key = accelerator.at(-1)!.toLocaleLowerCase();
          const modifierKeys = accelerator.slice(0, -1);
          return key === eventKey && Arrays.isEqual(modifierKeys, eventModifierKeys, {exactOrder: false});
        });
    }
  }

  private registerCloseMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.close_tab.action'},
        accelerator: config.accelerator ?? ['ctrl', 'k'],
        group: config.group ?? 'close',
        cssClass: config.cssClass ?? 'e2e-close',
        disabled: !view.isClosable(),
        onAction: () => void view.close(),
      }));
    }
  }

  private registerCloseOtherTabsMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.close_other_tabs.action'},
        accelerator: config.accelerator ?? ['ctrl', 'shift', 'k'],
        group: config.group ?? 'close',
        cssClass: config.cssClass ?? 'e2e-close-other-tabs',
        disabled: view.first() && view.last(),
        onAction: () => void view.close('other-views'),
      }));
    }
  }

  private registerCloseAllTabsMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.close_all_tabs.action'},
        accelerator: config.accelerator ?? ['ctrl', 'shift', 'alt', 'k'],
        group: config.group ?? 'close',
        cssClass: config.cssClass ?? 'e2e-close-all-tabs',
        onAction: () => void view.close('all-views'),
      }));
    }
  }

  private registerCloseRightTabsMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.close_tabs_to_the_right.action'},
        group: config.group ?? 'close',
        cssClass: config.cssClass ?? 'e2e-close-right-tabs',
        disabled: view.last(),
        onAction: () => void view.close('views-to-the-right'),
      }));
    }
  }

  private registerCloseLeftTabsMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.close_tabs_to_the_left.action'},
        group: config.group ?? 'close',
        cssClass: config.cssClass ?? 'e2e-close-left-tabs',
        disabled: view.first(),
        onAction: () => void view.close('views-to-the-left'),
      }));
    }
  }

  private registerMoveRightMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.move_tab_to_the_right.action'},
        accelerator: ['ctrl', 'alt', 'end'],
        group: config.group ?? 'move',
        cssClass: config.cssClass ?? 'e2e-move-right',
        disabled: view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'east'}),
      }));
    }
  }

  private registerMoveLeftMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.move_tab_to_the_left.action'},
        group: config.group ?? 'move',
        cssClass: config.cssClass ?? 'e2e-move-left',
        disabled: view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'west'}),
      }));
    }
  }

  private registerMoveUpMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.move_tab_up.action'},
        group: config.group ?? 'move',
        cssClass: config.cssClass ?? 'e2e-move-up',
        disabled: view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'north'}),
      }));
    }
  }

  private registerMoveDownMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => ({
        content: TextComponent,
        inputs: {text: '%workbench.move_tab_down.action'},
        group: config.group ?? 'move',
        cssClass: config.cssClass ?? 'e2e-move-down',
        disabled: view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'south'}),
      }));
    }
  }

  private registerMoveToNewWindowMenuItem(config: MenuItemConfig | false): void {
    if (isEnabled(config)) {
      this._workbenchService.registerViewMenuItem(view => {
        if (view.part().peripheral()) {
          return null;
        }

        return {
          content: TextComponent,
          inputs: {text: '%workbench.move_tab_to_new_window.action'},
          group: config.group ?? 'open',
          cssClass: config.cssClass ?? 'e2e-move-to-new-window',
          onAction: () => view.move('new-window'),
        };
      });
    }
  }
}

/**
 * Tests if given built-in menu item is enabled for display.
 */
function isEnabled(config: MenuItemConfig | false): config is MenuItemConfig {
  return config && (config.visible ?? true);
}

/**
 * Returns the pressed modifier keys (ctrl, shift, alt, meta) as array items.
 */
function getModifierState(event: KeyboardEvent): string[] {
  const modifierState: string[] = [];
  if (event.ctrlKey) {
    modifierState.push('ctrl');
  }
  if (event.shiftKey) {
    modifierState.push('shift');
  }
  if (event.altKey) {
    modifierState.push('alt');
  }
  if (event.metaKey) {
    modifierState.push('meta');
  }
  return modifierState;
}

export interface Point {
  x: number;
  y: number;
}
