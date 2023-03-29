/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostListener, Injector, Input} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent} from '../view-list/view-list.component';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
})
export class ViewListButtonComponent {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  @Input()
  public count!: number;

  constructor(private _host: ElementRef,
              private _overlay: Overlay,
              private _injector: Injector) {
  }

  @HostListener('click')
  public onClick(): void {
    const config = new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(this._host)
        .withFlexibleDimensions(false)
        .withPositions([ViewListButtonComponent.SOUTH, ViewListButtonComponent.NORTH]),
    });

    const overlayRef = this._overlay.create(config);
    const injector = Injector.create({
      parent: this._injector,
      providers: [{provide: OverlayRef, useValue: overlayRef}],
    });

    overlayRef.attach(new ComponentPortal(ViewListComponent, null, injector));
  }
}
