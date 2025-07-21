/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ViewDropZoneDirective, WbViewDropEvent} from '../../view-dnd/view-drop-zone.directive';
import {WORKBENCH_ID} from '../../workbench-id';
import {GridDropTargets} from '../../view-dnd/grid-drop-targets.util';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {GridComponent} from '../../layout/grid/grid.component';
import {dasherize} from '../../common/dasherize.util';
import {WorkbenchPortalOutletDirective} from '../../portal/workbench-portal-outlet.directive';
import {WorkbenchDesktop} from '../../desktop/workbench-desktop.model';

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
  selector: `wb-part[data-partid="${MAIN_AREA}"]`, // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './main-area-part.component.html',
  styleUrls: ['./main-area-part.component.scss'],
  imports: [
    GridComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
  ],
  host: {
    '[attr.data-grid]': 'dasherize(part.gridName())',
    '[class.active]': 'part.active()',
  },
})
export class MainAreaPartComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _layout = inject(WorkbenchLayoutService).layout;
  private readonly _viewDragService = inject(ViewDragService);

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly mainAreaGrid = computed(() => this._layout().grids.mainArea);
  protected readonly desktop = inject(WorkbenchDesktop);
  protected readonly dasherize = dasherize;
  protected readonly canDrop = inject(ViewDragService).canDrop(computed(() => this._layout().grids.mainArea));

  protected onDesktopViewDrop(event: WbViewDropEvent): void {
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
        grid: this.mainAreaGrid(),
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }
}
