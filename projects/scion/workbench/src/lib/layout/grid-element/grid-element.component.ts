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
import {MPart, MTreeNode} from '../workbench-grid.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {WorkbenchLayoutService} from '../workbench-layout.service';
import {WorkbenchPortalOutletDirective} from '../../portal/workbench-portal-outlet.directive';
import {PartPortalPipe} from '../../part/part-portal.pipe';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {TreeNodeSashSizesPipe} from './tree-node-sash-sizes.pipe';

/**
 * Renders a {@link MTreeNode} or {@link MPart}.
 *
 * The workbench layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`.
 * Each node has two children, which can be either another node or a part (leaf). A node defines
 * a split layout in which the two children are arranged vertically or horizontally.
 *
 * Nodes are rendered as {@link SciSashboxComponent} and parts as {@link PartComponent} or {@link MainAreaPartComponent}.
 */
@Component({
  selector: 'wb-grid-element',
  templateUrl: './grid-element.component.html',
  styleUrls: ['./grid-element.component.scss'],
  imports: [
    WorkbenchPortalOutletDirective,
    PartPortalPipe,
    SciSashboxComponent,
    SciSashDirective,
    TreeNodeSashSizesPipe,
  ],
  host: {
    '[attr.data-parentnodeid]': 'element().parent?.id',
    '[attr.data-nodeid]': 'nodeId()',
    '[attr.data-partid]': 'partId()',
  },
})
export class GridElementComponent {

  public readonly element = input.required<MTreeNode | MPart>();

  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);

  protected readonly nodeId = computed(() => this.element() instanceof MTreeNode ? this.element().id : undefined);
  protected readonly partId = computed(() => this.element() instanceof MPart ? this.element().id : undefined);

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onSashEnd(treeNode: MTreeNode, {sash1, sash2}: {[sashKey: string]: number}): void {
    const ratio = sash1! / (sash1! + sash2!);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setTreeNodeSplitRatio(treeNode.id, ratio));
  }
}
