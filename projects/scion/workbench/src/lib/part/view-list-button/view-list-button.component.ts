/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ComponentRef, ElementRef, HostListener, Injector, NgZone, OnDestroy} from '@angular/core';
import {ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent, ViewListComponentInputs} from '../view-list/view-list.component';
import {WorkbenchPart} from '../workbench-part.model';
import {mapArray, subscribeInside} from '@scion/toolkit/operators';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {debounceTime, map, takeUntil} from 'rxjs/operators';
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
              private _zone: NgZone,
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
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(this._host)
      .withFlexibleDimensions(false)
      .withPositions([ViewListButtonComponent.SOUTH, ViewListButtonComponent.NORTH]);

    this._overlayRef = this._overlay.create(new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
      positionStrategy,
    }));

    const componentRef = this._overlayRef.attach(new ComponentPortal(ViewListComponent, null, Injector.create({
      parent: this._injector,
      providers: [{provide: OverlayRef, useValue: this._overlayRef}],
    })));

    this.updatePositionInputOnPositionChange(componentRef, positionStrategy);
  }

  /**
   * Updates 'position' input of {@link ViewListComponent} when the overlay position changes.
   */
  private updatePositionInputOnPositionChange(componentRef: ComponentRef<ViewListComponent>, positionStrategy: FlexibleConnectedPositionStrategy): void {
    positionStrategy.positionChanges
      .pipe(
        // Run inside Angular as Angular CDK emits position changes outside the Angular zone.
        // Otherwise, Angular would not invoke the `ngOnChanges` lifecycle hook when updating component input.
        subscribeInside(fn => this._zone.run(fn)),
        // TODO [Angular 16] Replace with `takeUntilDestroyed` operator and pass the `DestroyRef` of `ComponentRef`.
        takeUntil(new Observable(observer => componentRef.onDestroy(() => observer.next()))),
      )
      .subscribe(positionChange => {
        switch (positionChange.connectionPair) {
          case ViewListButtonComponent.NORTH:
            componentRef.setInput(ViewListComponentInputs.POSITION, 'north');
            break;
          case ViewListButtonComponent.SOUTH:
            componentRef.setInput(ViewListComponentInputs.POSITION, 'south');
            break;
        }
      });
  }

  public ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }
}
