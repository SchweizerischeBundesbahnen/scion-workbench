/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Injector} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {MenuItem, MenuItemSeparator} from './menu-item';
import {MENU_ITEMS, MenuComponent} from './menu.component';
import {ComponentPortal} from '@angular/cdk/portal';

const END: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
const START: ConnectedPosition = {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'};

@Injectable({providedIn: 'root'})
export class MenuService {

  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);

  /**
   * Shows a menu with passed menu items.
   */
  public openMenu(element: Element, menuItems: Array<MenuItem | MenuItemSeparator>): Promise<void> {
    const overlayRef = this._overlay.create(new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'e2e-application-menu',
      disposeOnNavigation: true,
      minWidth: element.getBoundingClientRect().width,
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(element)
        .withPositions([END, START])
        .withDefaultOffsetY(2)
        .withFlexibleDimensions(false),
    }));
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: OverlayRef, useValue: overlayRef},
        {provide: MENU_ITEMS, useValue: menuItems},
      ],
    });
    const componentRef = overlayRef.attach(new ComponentPortal(MenuComponent, null, injector));
    return new Promise<void>(resolve => componentRef.onDestroy(resolve));
  }
}
