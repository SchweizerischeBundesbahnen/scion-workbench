/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject} from '@angular/core';
import {WorkbenchLayoutService} from './workbench-layout.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {GridElementComponent} from './grid-element/grid-element.component';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {MPartGrid} from './workbench-layout.model';
import {RequiresDropZonePipe} from '../view-dnd/requires-drop-zone.pipe';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {GridElementIfVisiblePipe} from '../common/grid-element-if-visible.pipe';
import {WORKBENCH_ID} from '../workbench-id';
import {GridDropTargets} from '../view-dnd/grid-drop-targets.util';

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
 *
 * @see MainAreaLayoutComponent
 */
@Component({
  selector: 'wb-workbench-layout',
  templateUrl: './workbench-layout.component.html',
  styleUrls: ['./workbench-layout.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    GridElementComponent,
    GridElementIfVisiblePipe,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
    SciViewportComponent,
  ],
})
export class WorkbenchLayoutComponent {

  public layout: ɵWorkbenchLayout | undefined;
  protected grid: MPartGrid | undefined;

  private _workbenchId = inject(WORKBENCH_ID);
  private _viewDragService = inject(ViewDragService);
  private _workbenchLayoutService = inject(WorkbenchLayoutService);

  constructor() {
    effect(() => {
      const layout = this._workbenchLayoutService.layout();
      this.layout = layout ?? undefined;
      this.grid = layout?.maximized && layout?.mainAreaGrid ? layout?.mainAreaGrid : layout?.workbenchGrid;
    });
  }

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
        grid: this.grid!,
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
    });
  }
}
