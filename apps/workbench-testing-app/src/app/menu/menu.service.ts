/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Injector} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {MenuItem, MenuItemSeparator} from './menu-item';
import {MENU_ITEMS, MenuComponent} from './menu.component';
import {ComponentPortal} from '@angular/cdk/portal';

const END: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
const START: ConnectedPosition = {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'};

@Injectable({providedIn: 'root'})
export class MenuService {

  constructor(private _overlay: Overlay, private _injector: Injector) {
  }

  /**
   * Shows a menu with passed menu items.
   */
  public openMenu(event: MouseEvent, menuItems: Array<MenuItem | MenuItemSeparator>): void {
    const overlayRef = this._overlay.create(new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      disposeOnNavigation: true,
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(event.target as HTMLElement)
        .withPositions([END, START])
        .withFlexibleDimensions(false),
    }));
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: OverlayRef, useValue: overlayRef},
        {provide: MENU_ITEMS, useValue: menuItems},
      ],
    });
    overlayRef.attach(new ComponentPortal(MenuComponent, null, injector));
  }
}
