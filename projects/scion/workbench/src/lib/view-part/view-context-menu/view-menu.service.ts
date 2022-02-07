/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, Injectable, Injector} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewMenuComponent} from './view-menu.component';
import {WorkbenchMenuItem} from '../../workbench.model';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {filter, mapTo, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {fromEvent, merge, Observable, Subject, TeardownLogic} from 'rxjs';
import {coerceElement} from '@angular/cdk/coercion';
import {TEXT, TextComponent} from '../view-context-menu/text.component';
import {MenuItemConfig, WorkbenchModuleConfig} from '../../workbench-module-config';
import {WorkbenchService} from '../../workbench.service';
import {Arrays} from '@scion/toolkit/util';
import {filterArray} from '@scion/toolkit/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {WorkbenchView} from '../../view/workbench-view.model';

/**
 * Shows menu items of a {@link WorkbenchView} in a menu.
 */
@Injectable()
export class ViewMenuService {

  private static readonly TOP_LEFT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'};
  private static readonly TOP_RIGHT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top'};
  private static readonly BOTTOM_LEFT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'};
  private static readonly BOTTOM_RIGHT: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  constructor(private _overlay: Overlay,
              private _injector: Injector,
              private _viewRegistry: WorkbenchViewRegistry,
              private _workbench: WorkbenchService,
              private _workbenchModuleConfig: WorkbenchModuleConfig) {
    // Registers built-in menu items added to the context menu of every view tab.
    this.registerCloseViewMenuItem();
    this.registerCloseOtherViewsMenuItem();
    this.registerCloseAllViewsMenuItem();
    this.registerCloseViewsToTheRightMenuItem();
    this.registerCloseViewsToTheLeftMenuItem();
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
  public async showMenu(location: Point, viewId: string): Promise<boolean> {
    const view = this._viewRegistry.getElseThrow(viewId);
    const menuItems = await view.menuItems$.pipe(take(1)).toPromise();

    // Do not show the menu if there are no menu items registered.
    if (menuItems.length === 0) {
      return false;
    }

    // Prepare and display the menu overlay.
    const config = new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
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
        {provide: WorkbenchView, useValue: view},
        {provide: ɵWorkbenchView, useValue: view},
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
          // skip menu items which have no accelerator configured
          filterArray((menuItem: WorkbenchMenuItem) => !!menuItem.accelerator && menuItem.accelerator.length > 0),
          // register the menu item keyboard accelerators
          switchMap((menuItems: WorkbenchMenuItem[]): Observable<WorkbenchMenuItem> => {
            const accelerators$ = menuItems.map(menuItem => {
              const key = Arrays.last(menuItem.accelerator!);
              const modifierKeys = menuItem.accelerator!.slice(0, -1);

              return fromEvent<KeyboardEvent>(coerceElement(target), 'keydown')
                .pipe(
                  filter(event => event.key?.toLowerCase() === key!.toLowerCase()), // ignore the shift modifier when comparing the pressed key
                  filter(event => Arrays.isEqual(modifierKeys, getModifierState(event), {exactOrder: false})), // check the modifier state of the pressed key
                  tap(event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }),
                  mapTo(menuItem),
                );
            });
            return merge(...accelerators$);
          }),
          filter((menuItem: WorkbenchMenuItem) => !menuItem.isDisabled || !menuItem.isDisabled()),
          takeUntil(unsubscribe$),
        )
        .subscribe((menuItem: WorkbenchMenuItem) => {
          menuItem.onAction();
        });

      return (): void => unsubscribe$.next();
    });
  }

  private registerCloseViewMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close tab', group: 'close', accelerator: ['ctrl', 'k']};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.close;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return ({
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        onAction: (): void => void view.close('self').then(),
      });
    });
  }

  private registerCloseOtherViewsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close other tabs', group: 'close', accelerator: ['ctrl', 'shift', 'k']};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.closeOthers;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return ({
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first && view.last,
        onAction: (): void => void view.close('other-views').then(),
      });
    });
  }

  private registerCloseAllViewsMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close all tabs', group: 'close', accelerator: ['ctrl', 'shift', 'alt', 'k'], cssClass: 'e2e-close-all-tabs'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.closeAll;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
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

  private registerCloseViewsToTheRightMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close tabs to the right', group: 'close'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.closeToTheRight;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.last,
        onAction: (): void => void view.close('views-to-the-right').then(),
      };
    });
  }

  private registerCloseViewsToTheLeftMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Close tabs to the left', group: 'close'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.closeToTheLeft;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first,
        onAction: (): void => void view.close('views-to-the-left').then(),
      };
    });
  }

  private registerMoveRightMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move right', group: 'move', accelerator: ['ctrl', 'alt', 'end']};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.moveRight;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first && view.last,
        onAction: (): void => void view.move('east').then(),
      };
    });
  }

  private registerMoveLeftMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move left', group: 'move'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.moveLeft;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first && view.last,
        onAction: (): void => void view.move('west').then(),
      };
    });
  }

  private registerMoveUpMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move up', group: 'move'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.moveUp;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first && view.last,
        onAction: (): void => void view.move('north').then(),
      };
    });
  }

  private registerMoveDownMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move down', group: 'move'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.moveDown;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        isDisabled: (): boolean => view.first && view.last,
        onAction: (): void => void view.move('south').then(),
      };
    });
  }

  private registerMoveToNewWindowMenuItem(): void {
    const defaults: MenuItemConfig = {visible: true, text: 'Move to new window', group: 'open'};
    const appConfig: MenuItemConfig | undefined = this._workbenchModuleConfig.viewMenuItems?.moveBlank;
    const config = {...defaults, ...appConfig};

    config.visible && this._workbench.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => {
      const injector = Injector.create({
        parent: Injector.NULL,
        providers: [{provide: TEXT, useValue: config.text}],
      });
      return {
        portal: new ComponentPortal(TextComponent, null, injector),
        accelerator: config.accelerator,
        group: config.group,
        cssClass: config.cssClass,
        onAction: (): void => void view.move('blank-window').then(),
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
