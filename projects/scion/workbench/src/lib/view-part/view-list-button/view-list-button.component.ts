/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Injector, OnDestroy} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent} from '../view-list/view-list.component';
import {combineLatest, Subject, switchMap} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ɵWorkbenchViewPart} from '../ɵworkbench-view-part.model';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {mapArray} from '@scion/toolkit/operators';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewListButtonComponent implements OnDestroy {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  private _destroy$ = new Subject<void>();

  public count = 0;

  @HostBinding('class.visible')
  public get visible(): boolean {
    return this.count > 0;
  }

  constructor(private _viewPart: ɵWorkbenchViewPart,
              private _host: ElementRef,
              private _overlay: Overlay,
              private _injector: Injector,
              private _viewRegistry: WorkbenchViewRegistry,
              private _cd: ChangeDetectorRef) {
    this.installHiddenViewTabCollector();
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

  private installHiddenViewTabCollector(): void {
    this._viewPart.viewIds$
      .pipe(
        mapArray(viewId => this._viewRegistry.getElseThrow(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
        map(views => views.reduce((count, view) => view.scrolledIntoView ? count : count + 1, 0)),
        takeUntil(this._destroy$),
      )
      .subscribe(count => {
        this.count = count;
        this._cd.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
