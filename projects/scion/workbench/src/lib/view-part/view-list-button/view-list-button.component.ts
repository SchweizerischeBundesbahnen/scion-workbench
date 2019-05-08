/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostBinding, HostListener, Injector } from '@angular/core';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ViewListComponent } from '../view-list/view-list.component';

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
    return this._viewPartService.hiddenViewTabCount > 0;
  }

  constructor(private _viewPartService: WorkbenchViewPartService,
              private _host: ElementRef,
              private _overlay: Overlay,
              private _injector: Injector) {
  }

  public get hiddenViewTabCount(): number {
    return this._viewPartService.hiddenViewTabCount;
  }

  @HostListener('click')
  public openViewList(): void {
    const config = new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      hasBackdrop: true,
      backdropClass: null,
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(this._host)
        .withFlexibleDimensions(false)
        .withPositions([ViewListButtonComponent.SOUTH, ViewListButtonComponent.NORTH]),
    });
    config['disposeOnNavigation'] = true; // added in CDK 7.x

    const overlayRef = this._overlay.create(config);
    const injectionTokens = new WeakMap();
    injectionTokens.set(OverlayRef, overlayRef);
    const injector = new PortalInjector(this._injector, injectionTokens);

    overlayRef.attach(new ComponentPortal(ViewListComponent, null, injector));
  }
}
