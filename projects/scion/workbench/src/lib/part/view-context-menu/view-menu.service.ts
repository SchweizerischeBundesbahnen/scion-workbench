/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewMenuComponent} from './view-menu.component';
import {WorkbenchMenuItem} from '../../workbench.model';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {firstValueFrom, fromEvent, Observable, Subject, TeardownLogic} from 'rxjs';
import {coerceElement} from '@angular/cdk/coercion';
import {TEXT, TextComponent} from '../view-context-menu/text.component';
import {MenuItemConfig, WorkbenchConfig} from '../../workbench-config';
import {WorkbenchService} from '../../workbench.service';
import {filterArray, observeIn} from '@scion/toolkit/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {provideViewContext} from '../../view/view-context-provider';
import {Arrays} from '@scion/toolkit/util';

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
  private readonly _zone = inject(NgZone);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _workbenchConfig = inject(WorkbenchConfig);

  constructor() {
    // Registers built-in menu items added to the context menu of every view tab.
    this.registerCloseMenuItem();
    this.registerCloseOtherTabsMenuItem();
    this.registerCloseAllTabsMenuItem();
    this.registerCloseRightTabsMenuItem();
    this.registerCloseLeftTabsMenuItem();
    this.registerMoveRightMenuItem();
    this.registerMoveLeftMenuItem();
    this.registerMoveUpMenuItem();
    this.registerMoveDownMenuItem();
    this.registerMoveToNewWindowMenuItem();
  }

  /**
   * Shows a menu with menu items registered in given {@link WorkbenchView}.
   *
   * @see {@link WorkbenchView.registerViewMenuItem}
   */
  public async showMenu(location: Point, viewId: ViewId): Promise<boolean> {
    const view = this._viewRegistry.get(viewId);
    const menuItems = await firstValueFrom(view.menuItems$);

    // Do not show the menu if there are no menu items registered.
    if (menuItems.length === 0) {
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
   * Upon subscription, installs keyboard accelerators of the menu items registered in {@link WorkbenchView}.
   */
  public installMenuItemAccelerators$(target: ElementRef<HTMLElement> | HTMLElement, view: ɵWorkbenchView): Observable<void> {
    return new Observable((): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();

      view.menuItems$
        .pipe(
          observeIn(fn => this._zone.runOutsideAngular(fn)),
          // Skip menu items which have no accelerator configured.
          filterArray((menuItem: WorkbenchMenuItem) => !!menuItem.accelerator?.length),
          filter(menuItems => menuItems.length > 0),
          // Subscribe for keyboard events.
          switchMap((menuItems: WorkbenchMenuItem[]): Observable<{event: KeyboardEvent; menuItems: WorkbenchMenuItem[]}> => {
            return fromEvent<KeyboardEvent>(coerceElement(target), 'keydown').pipe(map(event => ({event, menuItems})));
          }),
          map(({event, menuItems}) => ({
            event,
            menuItems: menuItems
              .filter(menuItem => !menuItem.isDisabled?.())
              .filter(menuItem => {
                const accelerator = menuItem.accelerator!;
                const key = accelerator.at(-1)!;
                const modifierKeys = accelerator.slice(0, -1);

                // Compare key.
                if (event.key?.toLowerCase() !== key.toLowerCase()) {
                  return false;
                }
                // Compare modifiers.
                if (!Arrays.isEqual(modifierKeys, getModifierState(event), {exactOrder: false})) {
                  return false;
                }
                return true;
              }),
          })),
          filter(({menuItems}) => menuItems.length > 0),
          observeIn(fn => this._zone.run(fn)),
          takeUntil(unsubscribe$),
        )
        .subscribe(({event, menuItems}) => {
          event.preventDefault();
          event.stopPropagation();
          runInInjectionContext(this._injector, () => {
            menuItems.forEach(menuItem => menuItem.onAction());
          });
        });

      return (): void => unsubscribe$.next();
    });
  }

  private registerCloseMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close', group: 'close', accelerator: ['ctrl', 'k'], cssClass: 'e2e-close'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.close;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return ({
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => !view.closable(),
        onAction: (): void => void view.close().then(),
      });
    });
  }

  private registerCloseOtherTabsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close other tabs', group: 'close', accelerator: ['ctrl', 'shift', 'k'], cssClass: ' e2e-close-other-tabs'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.closeOthers;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return ({
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first() && view.last(),
        onAction: (): void => void view.close('other-views').then(),
      });
    });
  }

  private registerCloseAllTabsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close all tabs', group: 'close', accelerator: ['ctrl', 'shift', 'alt', 'k'], cssClass: 'e2e-close-all-tabs'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.closeAll;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return ({
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        onAction: (): void => void view.close('all-views').then(),
      });
    });
  }

  private registerCloseRightTabsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close tabs to the right', group: 'close', cssClass: 'e2e-close-right-tabs'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.closeToTheRight;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.last(),
        onAction: (): void => void view.close('views-to-the-right').then(),
      };
    });
  }

  private registerCloseLeftTabsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close tabs to the left', group: 'close', cssClass: 'e2e-close-left-tabs'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.closeToTheLeft;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first(),
        onAction: (): void => void view.close('views-to-the-left').then(),
      };
    });
  }

  private registerMoveRightMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move right', group: 'move', accelerator: ['ctrl', 'alt', 'end'], cssClass: 'e2e-move-right'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.moveRight;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: () => view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'east'}),
      };
    });
  }

  private registerMoveLeftMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move left', group: 'move', cssClass: 'e2e-move-left'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.moveLeft;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: () => view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'west'}),
      };
    });
  }

  private registerMoveUpMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move up', group: 'move', cssClass: 'e2e-move-up'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.moveUp;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: () => view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'north'}),
      };
    });
  }

  private registerMoveDownMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move down', group: 'move', cssClass: 'e2e-move-down'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.moveDown;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: () => view.first() && view.last(),
        onAction: () => view.move(view.part().id, {region: 'south'}),
      };
    });
  }

  private registerMoveToNewWindowMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move to new window', group: 'open', cssClass: 'e2e-move-to-new-window'};
    const appConfig: MenuItemConfig | undefined = this._workbenchConfig.viewMenuItems?.moveToNewWindow;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        onAction: () => view.move('new-window'),
      };
    });
  }
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
