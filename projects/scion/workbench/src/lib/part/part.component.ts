/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, inject, Injector, NgZone, OnDestroy, OnInit} from '@angular/core';
import {combineLatestWith, EMPTY, from, fromEvent, merge, mergeMap, switchMap} from 'rxjs';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {take} from 'rxjs/operators';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {Logger, LoggerNames} from '../logging';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {AsyncPipe} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {PartBarComponent} from './part-bar/part-bar.component';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';
import {ViewPortalPipe} from '../view/view-portal.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../workbench-id';

@Component({
  selector: 'wb-part',
  templateUrl: './part.component.html',
  styleUrls: ['./part.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    PartBarComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
    ViewPortalPipe,
  ],
})
export class PartComponent implements OnInit, OnDestroy {

  @HostBinding('attr.tabindex')
  public tabIndex = -1;

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this.part.id;
  }

  @HostBinding('class.e2e-main-area')
  public get isInMainArea(): boolean {
    return this.part.isInMainArea;
  }

  @HostBinding('class.main-area')
  public get isMainArea(): boolean {
    return this.part.isInMainArea;
  }

  @HostBinding('class.active')
  public get isActive(): boolean {
    return this.part.active;
  }

  constructor(@Inject(WORKBENCH_ID) private _workbenchId: string,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewDragService: ViewDragService,
              private _injector: Injector,
              private _logger: Logger,
              private _cd: ChangeDetectorRef,
              public part: ɵWorkbenchPart) {
    this._logger.debug(() => `Constructing PartComponent [partId=${this.partId}]`, LoggerNames.LIFECYCLE);
    this.activatePartOnFocusIn();
    this.constructInactiveViewComponents();
  }

  public ngOnInit(): void {
    // Perform a manual change detection run to avoid `ExpressionChangedAfterItHasBeenCheckedError` that would occur
    // when the view sets view properties in its constructor. Because the view tab is located before the view in the
    // Angular component tree, Angular checks the view tab for changes before the view. Therefore, if the view sets
    // its title during construction, then the view tab label will also change, causing the error.
    this._cd.detectChanges();
  }

  /**
   * Method invoked to move a view into this part.
   */
  public onViewDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        workbenchId: event.dragData.workbenchId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        alternativeViewId: event.dragData.alternativeViewId,
        viewUrlSegments: event.dragData.viewUrlSegments,
        navigationHint: event.dragData.navigationHint,
        classList: event.dragData.classList,
      },
      target: {
        workbenchId: this._workbenchId,
        elementId: this.part.id,
        region: event.dropRegion === 'center' ? undefined : event.dropRegion,
      },
    });
  }

  /**
   * Constructs view components of inactive views, so they can initialize, e.g., to set the view tab title.
   */
  private constructInactiveViewComponents(): void {
    this.part.viewIds$
      .pipe(
        mapArray(viewId => this._viewRegistry.get(viewId)),
        filterArray(view => !view.active && !view.portal.isConstructed),
        mergeMap(views => from(views)),
      )
      .subscribe(inactiveView => {
        inactiveView.portal.createComponentFromInjectionContext(this._injector);
      });
  }

  /**
   * Activates this part when it gains focus.
   */
  private activatePartOnFocusIn(): void {
    const host = inject(ElementRef).nativeElement;

    this.part.active$
      .pipe(
        // Wait until the zone has stabilized to not activate the part on creation, but only on user interaction.
        // For example, if the view sets the initial focus, the related `focusin` event should not activate the part.
        combineLatestWith(inject(NgZone).onStable.pipe(take(1))),
        // Suspend listening for `focusin` or `sci-microfrontend-focusin` events while this part is active.
        switchMap(([active]) => active ? EMPTY : merge(fromEvent<FocusEvent>(host, 'focusin', {once: true}), fromEvent(host, 'sci-microfrontend-focusin', {once: true}))),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.part.activate().then();
      });
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying PartComponent [partId=${this.partId}]'`, LoggerNames.LIFECYCLE);
  }
}
