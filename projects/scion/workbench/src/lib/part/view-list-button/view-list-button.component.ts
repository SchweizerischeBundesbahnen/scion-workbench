/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ComponentRef, computed, DestroyRef, ElementRef, HostListener, inject, Injector, NgZone, OnDestroy, Signal} from '@angular/core';
import {ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent, ViewListComponentInputs} from '../view-list/view-list.component';
import {WorkbenchPart} from '../workbench-part.model';
import {observeIn} from '@scion/toolkit/operators';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
  standalone: true,
})
export class ViewListButtonComponent implements OnDestroy {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'};

  private readonly _host = inject(ElementRef);
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);

  private _overlayRef: OverlayRef | undefined;
  /** Number of views that are scrolled out of the tab bar. */
  protected readonly scrolledOutOfViewTabCount: Signal<number>;

  constructor() {
    const part = inject(WorkbenchPart);
    const viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
    this.scrolledOutOfViewTabCount = computed(() => part.viewIds()
      .map(viewId => viewRegistry.get(viewId))
      .reduce((count, view) => view.scrolledIntoView() ? count : count + 1, 0));
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
        // Ensure running inside Angular as Angular CDK emits position changes outside the Angular zone.
        // Otherwise, Angular would not invoke the `ngOnChanges` lifecycle hook when updating component input.
        observeIn(fn => this._zone.run(fn)),
        takeUntilDestroyed(componentRef.injector.get(DestroyRef)),
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
