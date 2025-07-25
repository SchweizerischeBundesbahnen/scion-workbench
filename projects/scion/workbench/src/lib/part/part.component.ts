/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, inject, Injector, OnInit, untracked} from '@angular/core';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {Logger, LoggerNames} from '../logging';
import {PartBarComponent} from './part-bar/part-bar.component';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';
import {WORKBENCH_ID} from '../workbench.identifiers';
import {synchronizeCssClasses} from '../common/css-class.util';
import {dasherize} from '../common/dasherize.util';

@Component({
  selector: 'wb-part',
  templateUrl: './part.component.html',
  styleUrl: './part.component.scss',
  imports: [
    PartBarComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
  ],
  host: {
    '[attr.data-partid]': 'part.id',
    '[attr.data-peripheral]': `part.peripheral() ? '' : null`,
    '[attr.data-grid]': 'dasherize(part.gridName())',
    '[attr.data-active]': `part.active() ? '' : null`,
    '[attr.data-referencepart]': `part.referencePart() ? '' : null`,
    '[attr.tabindex]': '-1',
  },
})
export class PartComponent implements OnInit {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _injector = inject(Injector);
  private readonly _cd = inject(ChangeDetectorRef);

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly canDrop = inject(ViewDragService).canDrop(inject(ɵWorkbenchPart));
  protected readonly dasherize = dasherize;

  constructor() {
    this.installComponentLifecycleLogger();
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
      const views = this.part.views();
      untracked(() => views
        .filter(view => !view.active() && !view.slot.portal.constructed())
        .forEach(inactiveView => {
          inactiveView.slot.portal.construct(this._injector);
        }));
    });
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, this.part.classList.asList);
  }

  private installComponentLifecycleLogger(): void {
    const logger = inject(Logger);
    logger.debug(() => `Constructing PartComponent [partId=${this.part.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying PartComponent [partId=${this.part.id}]'`, LoggerNames.LIFECYCLE));
  }
}
