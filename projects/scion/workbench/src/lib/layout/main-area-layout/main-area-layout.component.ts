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

/**
 * Renders main area layout.
 *
 * The main area layout defines the arrangement of parts in the main area. The main area is the primary place to open views.
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
 * @see MainAreaLayoutComponent
 */
@Component({
  selector: 'wb-main-area-layout',
  templateUrl: './main-area-layout.component.html',
  styleUrls: ['./main-area-layout.component.scss'],
  standalone: true,
  imports: [GridElementComponent],
})
export class MainAreaLayoutComponent {

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this._part.id;
  }

  constructor(private _part: ɵWorkbenchPart, private _workbenchLayoutService: WorkbenchLayoutService) {
  }

  /**
   * Root element of the main area layout.
   */
  public get root(): MTreeNode | MPart {
    // It is critical that both `WorkbenchLayoutComponent` and `MainAreaLayoutComponent` operate on the same layout,
    // so we do not subscribe to the layout but reference it directly.
    return this._workbenchLayoutService.layout!.mainGrid.root;
  }
}
