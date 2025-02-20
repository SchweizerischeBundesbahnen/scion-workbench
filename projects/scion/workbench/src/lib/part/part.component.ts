/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, HostBinding, inject, Injector, OnInit, untracked} from '@angular/core';
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
import {SciViewportComponent} from '@scion/components/viewport';
import {RouterOutletRootContextDirective} from '../routing/router-outlet-root-context.directive';
import {synchronizeCssClasses} from '../common/css-class.util';
import {RouterOutlet} from '@angular/router';
import {PartId} from './workbench-part.model';

@Component({
  selector: 'wb-part',
  templateUrl: './part.component.html',
  styleUrls: ['./part.component.scss'],
  imports: [
    PartBarComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
    RouterOutlet,
    RouterOutletRootContextDirective,
    ViewPortalPipe,
    SciViewportComponent,
  ],
})
export class PartComponent implements OnInit {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _injector = inject(Injector);
  private readonly _cd = inject(ChangeDetectorRef);

  protected readonly part = inject(ɵWorkbenchPart);

  @HostBinding('attr.tabindex')
  protected tabIndex = -1;

  @HostBinding('attr.data-partid')
  protected get partId(): PartId {
    return this.part.id;
  }

  /**
   * Gets the context in which this part is used.
   */
  @HostBinding('attr.data-context')
  protected get context(): 'main-area' | null {
    return this.part.isInMainArea ? 'main-area' : null;
  }

  @HostBinding('class.active')
  protected get isActive(): boolean {
    return this.part.active();
  }

  constructor() {
    this.installComponentLifecycleLogger();
    this.activatePartOnFocusIn();
    this.constructInactiveViewComponents();
    this.addHostCssClasses();
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
  protected onViewDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        workbenchId: event.dragData.workbenchId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        alternativeViewId: event.dragData.alternativeViewId,
        navigation: event.dragData.navigation,
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
    const host = inject(ElementRef).nativeElement as HTMLElement;

    toObservable(this.part.active)
      .pipe(
        switchMap(active => active ? EMPTY : merge(fromEvent<FocusEvent>(host, 'focusin', {once: true}), fromEvent(host, 'sci-microfrontend-focusin', {once: true}))),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        void this.part.activate();
      });
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, this.part.classList.asList);
  }

  private installComponentLifecycleLogger(): void {
    const logger = inject(Logger);
    logger.debug(() => `Constructing PartComponent [partId=${this.partId}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying PartComponent [partId=${this.partId}]'`, LoggerNames.LIFECYCLE));
  }
}
