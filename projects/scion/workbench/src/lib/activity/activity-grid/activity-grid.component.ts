/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, input} from '@angular/core';
import {ActivityId} from '../workbench-activity.model';
import {GridElementComponent} from '../../layout/grid-element/grid-element.component';
import {GridElementIfVisiblePipe} from '../../common/grid-element-if-visible.pipe';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MPartGrid} from '../../layout/workbench-layout.model';

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
  selector: 'wb-activity-grid',
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss'],
  standalone: true,
  imports: [
    GridElementComponent,
    GridElementIfVisiblePipe,
  ],
})
export class ActivityGridComponent {

  public readonly activityId = input.required<ActivityId>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);

  protected readonly grid = computed((): MPartGrid | undefined => {
    const layout = this._workbenchLayoutService.layout();
    return layout?.grids[this.activityId()];
  });
}
