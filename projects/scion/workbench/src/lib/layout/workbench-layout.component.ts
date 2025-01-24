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
import {WorkbenchLayoutService} from './workbench-layout.service';
import {GridElementComponent} from './grid-element/grid-element.component';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {RequiresDropZonePipe} from '../view-dnd/requires-drop-zone.pipe';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {GridElementIfVisiblePipe} from '../common/grid-element-if-visible.pipe';
import {WORKBENCH_ID} from '../workbench-id';
import {GridDropTargets} from '../view-dnd/grid-drop-targets.util';
import {MPartGrid} from './workbench-layout.model';
import {Logger} from '../logging';
import {NgTemplateOutlet} from '@angular/common';
import {DESKTOP} from '../workbench-element-references';

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
    NgTemplateOutlet,
  ],
})
export class WorkbenchLayoutComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _logger = inject(Logger);

  protected readonly desktop = inject(DESKTOP);
  protected readonly grid = computed((): MPartGrid | undefined => {
    const layout = this._workbenchLayoutService.layout();
    return layout && layout.maximized && layout.mainAreaGrid ? layout.mainAreaGrid : layout?.workbenchGrid;
  });

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
        grid: this.grid()!,
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }

  protected onLegacyStartPageActivate(): void {
    this._logger.warn('[Deprecation] The configuration for displaying a start page in the workbench has changed. Provide a desktop using an `<ng-template>` with the `wbDesktop` directive. The template content will be used as the desktop content. Previously, the component associated with the empty path route was used as the start page. Legacy support will be removed in version 21.', `
    
    Example:
    <wb-workbench>
      <ng-template wbDesktop>
        Welcome
      </ng-template>
    </wb-workbench>
    `,
    );
  }
}
