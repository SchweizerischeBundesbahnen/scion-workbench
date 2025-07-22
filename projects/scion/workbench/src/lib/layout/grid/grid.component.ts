/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {GridElementComponent} from '../grid-element/grid-element.component';
import {RequiresDropZonePipe} from '../../view-dnd/requires-drop-zone.pipe';
import {ViewDropZoneDirective, WbViewDropEvent} from '../../view-dnd/view-drop-zone.directive';
import {MPartGrid} from '../workbench-grid.model';
import {GridDropTargets} from '../../view-dnd/grid-drop-targets.util';
import {WORKBENCH_ID} from '../../workbench.identifiers';
import {ViewDragService} from '../../view-dnd/view-drag.service';

/**
 * Renders the layout of the workbench.
 *
 * The workbench layout is a grid of parts. It contains at least one part. A special part, the main area part, is not a stack of views
 * but embeds a sub-grid, the main area grid. It defines the arrangement of parts in the main area. The main area is optional.
 *
 * The layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`. Each node has two children, which can be either
 * another node or a part (leaf). A node defines a split layout in which the two children are arranged vertically or horizontally.
 *
 *                       MTreeNode
 *                           |
 *            +--------------+--------------+
 *            |                             |                        +--------+-----------------------+
 *        MTreeNode                       MPart                      |  left  | +---------+---------+ |
 *     +------+------+                 (MAIN_AREA)                   |  top   | |         |         | |
 *     |             |                      |              ======>   |--------+ | left    | right   | |
 *   MPart         MPart                 MTreeNode         renders   |  left  | |         |         | |
 * (left-top)  (left-bottom)         +------+------+                 | bottom | +---------+---------+ |
 *                                   |             |                 +--------+-----------------------+
 *                                 MPart         MPart
 *                                (left)        (right)
 */
@Component({
  selector: 'wb-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  imports: [
    GridElementComponent,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
  ],
})
export class GridComponent {

  /**
   * Specifies the grid to render.
   */
  public readonly grid = input.required<MPartGrid>();

  /**
   * Controls dropping at the grid boundaries.
   */
  public readonly gridDropZone = input<GridDropZoneConfig | false>(false);

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewDragService = inject(ViewDragService);

  protected readonly canDrop = inject(ViewDragService).canDrop(this.grid);

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
      target: GridDropTargets.resolve({
        grid: this.grid(),
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }
}

/**
 * Configures the drop zones of a grid.
 */
export interface GridDropZoneConfig {
  /**
   * Specifies the size of a drop zone region, either as percentage value [0,1] or absolute pixel value.
   */
  dropRegionSize?: number;
  /**
   * Specifies the size of the visual placeholder when dragging a view over a drop region.
   * Can be a percentage value [0,1] or absolute pixel value. Defaults to {@link dropRegionSize}.
   */
  dropPlaceholderSize?: number;
  /**
   * Specifies attribute(s) to add to the drop zones.
   */
  dropZoneAttributes?: {[name: string]: unknown};
}
