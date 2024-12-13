/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, HostBinding, inject} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {GridElementComponent} from '../../layout/grid-element/grid-element.component';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ViewDropZoneDirective, WbViewDropEvent} from '../../view-dnd/view-drop-zone.directive';
import {RequiresDropZonePipe} from '../../view-dnd/requires-drop-zone.pipe';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {GridElementIfVisiblePipe} from '../../common/grid-element-if-visible.pipe';
import {WORKBENCH_ID} from '../../workbench-id';
import {GridDropTargets} from '../../view-dnd/grid-drop-targets.util';
import {PART_ID_PREFIX} from '../../workbench.constants';
import {RootRouterOutletDirective} from '../../routing/root-router-outlet.directive';
import {Logger} from '../../logging';

/**
 * Renders the layout of the {@link MAIN_AREA} part.
 *
 * The main area is a special part that is a subgrid, not a stack of views.
 *
 * The main area has the following characteristics:
 * - is optional;
 * - is the primary place to open views;
 * - is shared by perspectives having a main area;
 * - can be maximized;
 *
 * The layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`. Each node has two children, which can be either
 * another node or a part (leaf). A node defines a split layout in which the two children are arranged vertically or horizontally.
 *
 *         MTreeNode
 *            |                         +------+-------+
 *     +------+------+        ======>   | left | right |
 *     |             |        renders   +------+-------+
 *   MPart         MPart
 *  (left)        (right)
 */
@Component({
  selector: 'wb-main-area-part',
  templateUrl: './main-area-part.component.html',
  styleUrls: ['./main-area-part.component.scss'],
  standalone: true,
  imports: [
    GridElementComponent,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
    RouterOutlet,
    SciViewportComponent,
    GridElementIfVisiblePipe,
    RootRouterOutletDirective,
  ],
})
export class MainAreaPartComponent {

  private _workbenchId = inject(WORKBENCH_ID);
  private _workbenchLayoutService = inject(WorkbenchLayoutService);
  private _viewDragService = inject(ViewDragService);
  private readonly _logger = inject(Logger);

  protected part = inject(ɵWorkbenchPart);
  protected mainAreaGrid = computed(() => this._workbenchLayoutService.layout()!.mainAreaGrid!);

  @HostBinding('attr.data-partid')
  protected partId = this.part.id;

  protected readonly PART_ID_PREFIX = PART_ID_PREFIX;

  protected onViewDrop(event: WbViewDropEvent): void {
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
      target: GridDropTargets.resolve({
        grid: this.mainAreaGrid(),
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }

  protected onStartPageActivate(): void {
    // TODO [activity] Print better warning
    this._logger.warn('[Workbench][Deprecation] Displaying a start page in the main area is deprecated. Instead, navigate the main area part in the workbench layout. This API will be removed in Angular 20.');
  }
}
