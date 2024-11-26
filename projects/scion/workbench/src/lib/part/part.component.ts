/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, effect, ElementRef, HostBinding, inject, Injector, OnDestroy, OnInit, untracked} from '@angular/core';
import {EMPTY, fromEvent, merge, switchMap} from 'rxjs';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {Logger, LoggerNames} from '../logging';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {PartBarComponent} from './part-bar/part-bar.component';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';
import {ViewPortalPipe} from '../view/view-portal.pipe';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../workbench-id';

@Component({
  selector: 'wb-part',
  templateUrl: './part.component.html',
  styleUrls: ['./part.component.scss'],
  standalone: true,
  imports: [
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
    return this.part.active();
  }

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _injector = inject(Injector);
  private readonly _logger = inject(Logger);
  private readonly _cd = inject(ChangeDetectorRef);

  protected readonly part = inject(ɵWorkbenchPart);

  constructor() {
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
        navigationData: event.dragData.navigationData,
        classList: event.dragData.classList,
      },
      target: {
        workbenchId: this._workbenchId,
        elementId: this.part.id,
        region: event.dropRegion === 'center' ? undefined : event.dropRegion,
      },
      dragData: event.dragData,
    });
  }

  /**
   * Constructs view components of inactive views, so they can initialize, e.g., to set the view tab title.
   */
  private constructInactiveViewComponents(): void {
    effect(() => {
      const viewIds = this.part.viewIds();
      untracked(() => viewIds
        .map(viewId => this._viewRegistry.get(viewId))
        .filter(view => !view.active() && !view.portal.isConstructed)
        .forEach(inactiveView => {
          inactiveView.portal.createComponentFromInjectionContext(this._injector);
        }));
    });
  }

  /**
   * Activates this part when it gains focus.
   */
  private activatePartOnFocusIn(): void {
    const host = inject(ElementRef).nativeElement;

    toObservable(this.part.active)
      .pipe(
        switchMap(active => active ? EMPTY : merge(fromEvent<FocusEvent>(host, 'focusin', {once: true}), fromEvent(host, 'sci-microfrontend-focusin', {once: true}))),
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
