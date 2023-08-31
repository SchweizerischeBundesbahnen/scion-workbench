/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MPart, MTreeNode} from '../workbench-layout.model';
import {WorkbenchLayoutService} from '../workbench-layout.service';
import {GridElementComponent} from '../grid-element/grid-element.component';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ViewDropZoneDirective, WbViewDropEvent} from '../../view-dnd/view-drop-zone.directive';
import {RequiresDropZonePipe} from '../../view-dnd/requires-drop-zone.pipe';

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
 *
 * @see WorkbenchLayoutComponent
 */
@Component({
  selector: 'wb-main-area-layout',
  templateUrl: './main-area-layout.component.html',
  styleUrls: ['./main-area-layout.component.scss'],
  standalone: true,
  imports: [
    GridElementComponent,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
  ],
})
export class MainAreaLayoutComponent {

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this._part.id;
  }

  constructor(private _part: ɵWorkbenchPart,
              private _workbenchService: ɵWorkbenchService,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _viewDragService: ViewDragService) {
  }

  /**
   * Root element of the main area layout.
   */
  public get root(): MTreeNode | MPart {
    // It is critical that both `WorkbenchLayoutComponent` and `MainAreaLayoutComponent` operate on the same layout,
    // so we do not subscribe to the layout but reference it directly.
    return this._workbenchLayoutService.layout!.mainAreaGrid!.root;
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
        elementId: this.root instanceof MPart ? this.root.id : this.root.nodeId,
        region: event.dropRegion,
        newPart: {ratio: .2},
      },
    });
  }
}
