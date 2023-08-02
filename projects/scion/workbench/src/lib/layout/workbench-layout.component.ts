/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {WorkbenchLayoutService} from './workbench-layout.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {GridElementComponent} from './grid-element/grid-element.component';
import {NgIf} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {MPart, MTreeNode} from './workbench-layout.model';
import {RequiresDropZonePipe} from '../view-dnd/requires-drop-zone.pipe';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';

/**
 * Renders the workbench layout.
 *
 * The workbench layout defines the arrangement of parts. A part is a stack of views.
 *
 * The workbench layout consists of a main and peripheral grid. The peripheral grid arranges parts around the main grid.
 * It contains at least the main area part {@link MAIN_AREA_PART_ID}, which is always present and common to all perspectives.
 * The main area part embeds the main grid.
 *
 * The layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`. Each node has two children, which can be either
 * another node or a part (leaf). A node defines a split layout in which the two children are arranged vertically or horizontally.
 *
 *                       MTreeNode
 *                           |
 *            +--------------+--------------+
 *            |                             |                        +--------+-----------------------+
 *        MTreeNode                       MPart                      |  left  | +---------+---------+ |
 *     +------+------+              (MAIN_AREA_PART_ID)              |  top   | |         |         | |
 *     |             |                      |              ======>   |--------+ | left    | right   | |
 *   MPart         MPart                 MTreeNode         renders   |  left  | |         |         | |
 * (left-top)  (left-bottom)         +------+------+                 | bottom | +---------+---------+ |
 *                                   |             |                 +--------+-----------------------+
 *                                 MPart         MPart
 *                                (left)        (right)
 *
 * @see WorkbenchLayoutComponent
 * @see MainAreaLayoutComponent
 */
@Component({
  selector: 'wb-workbench-layout',
  templateUrl: './workbench-layout.component.html',
  styleUrls: ['./workbench-layout.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    GridElementComponent,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
  ],
})
export class WorkbenchLayoutComponent {

  public layout: ɵWorkbenchLayout | undefined;
  public root: MTreeNode | MPart | undefined;

  constructor(workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchService: ɵWorkbenchService,
              private _viewDragService: ViewDragService) {
    workbenchLayoutService.layout$
      .pipe(takeUntilDestroyed())
      .subscribe(layout => {
        this.layout = layout;
        this.root = layout.maximized ? layout.mainGrid.root : layout.peripheralGrid.root;
      });
  }

  public onViewDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: event.dragData.appInstanceId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        viewUrlSegments: event.dragData.viewUrlSegments,
      },
      target: {
        appInstanceId: this._workbenchService.appInstanceId,
        elementId: this.root instanceof MPart ? this.root.id : this.root!.nodeId,
        region: event.dropRegion,
        newPart: {ratio: .2},
      },
    });
  }
}
