/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, HostListener, Injector} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent} from '../view-list/view-list.component';
import {ɵWorkbenchViewPart} from '../ɵworkbench-view-part.model';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
})
export class ViewListButtonComponent {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  @HostBinding('class.visible')
  public get visible(): boolean {
    return this._viewPart.hiddenViewTabCount > 0;
  }

  constructor(private _viewPart: ɵWorkbenchViewPart,
              private _host: ElementRef,
              private _overlay: Overlay,
              private _injector: Injector) {
  }

  public get hiddenViewTabCount(): number {
    return this._viewPart.hiddenViewTabCount;
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
