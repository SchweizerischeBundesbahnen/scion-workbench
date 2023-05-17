/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostListener, Injector, OnDestroy} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent} from '../view-list/view-list.component';
import {WorkbenchPart} from '../workbench-part.model';
import {mapArray} from '@scion/toolkit/operators';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
})
export class ViewListButtonComponent implements OnDestroy {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  private _overlayRef: OverlayRef | undefined;

  public scrolledOutOfViewTabCount$: Observable<number>;

  constructor(private _host: ElementRef,
              private _overlay: Overlay,
              private _injector: Injector,
              part: WorkbenchPart,
              viewRegistry: WorkbenchViewRegistry) {
    this.scrolledOutOfViewTabCount$ = part.viewIds$
      .pipe(
        mapArray(viewId => viewRegistry.get(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
        map(views => views.reduce((count, view) => view.scrolledIntoView ? count : count + 1, 0)),
        debounceTime(25),
      );
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

    this._overlayRef = this._overlay.create(config);
    const injector = Injector.create({
      parent: this._injector,
      providers: [{provide: OverlayRef, useValue: this._overlayRef}],
    });

    this._overlayRef.attach(new ComponentPortal(ViewListComponent, null, injector));
  }

  public ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }
}
