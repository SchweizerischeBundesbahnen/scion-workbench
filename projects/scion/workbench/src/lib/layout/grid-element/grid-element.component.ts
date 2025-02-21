/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, input, Signal, untracked} from '@angular/core';
import {MPart, MTreeNode} from '../workbench-layout.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {WorkbenchLayoutService} from '../workbench-layout.service';
import {InstanceofPipe} from '../../common/instanceof.pipe';
import {PortalModule} from '@angular/cdk/portal';
import {PartPortalPipe} from '../../part/part-portal.pipe';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {WorkbenchLayouts} from '../workbench-layouts.util';

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
    InstanceofPipe,
    PortalModule,
    PartPortalPipe,
    SciSashboxComponent,
    SciSashDirective,
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

  protected readonly MTreeNode = MTreeNode;
  protected readonly MPart = MPart;

  protected readonly nodeId = computed(() => this.element() instanceof MTreeNode ? this.element().id : undefined);
  protected readonly partId = computed(() => this.element() instanceof MPart ? this.element().id : undefined);
  protected readonly children = this.computeChildren();

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onSashEnd(treeNode: MTreeNode, [sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setSplitRatio(treeNode.id, ratio));
  }

  private computeChildren(): Signal<ChildElement[]> {
    return computed(() => {
      const treeNode = this.element();
      if (!(treeNode instanceof MTreeNode)) {
        return [];
      }

      return untracked(() => {
        const child1Visible = WorkbenchLayouts.isGridElementVisible(treeNode.child1);
        const child2Visible = WorkbenchLayouts.isGridElementVisible(treeNode.child2);

        if (child1Visible && child2Visible) {
          const [size1, size2] = calculateSashSizes(treeNode.ratio);
          return [
            {element: treeNode.child1, size: size1},
            {element: treeNode.child2, size: size2},
          ];
        }
        else if (child1Visible) {
          return [{element: treeNode.child1}];
        }
        else if (child2Visible) {
          return [{element: treeNode.child2}];
        }
        return [];
      });
    });
  }
}

/**
 * Calculates the two sash proportions for the given ratio. Each proportion is >= 1.
 */
function calculateSashSizes(ratio: number): [string, string] {
  // Important: `SciSashboxComponent` requires proportions to be >= 1. For this reason we cannot simply calculate [ratio, 1 - ratio].
  if (ratio === 0) {
    return ['0px', '1'];
  }
  if (ratio === 1) {
    return ['1', '0px'];
  }

  return [`${1 / (1 - ratio)}`, `${1 / ratio}`];
}

/**
 * Represents a visible child of a {@link MTreeNode}.
 */
interface ChildElement {
  element: MTreeNode | MPart;
  size?: string;
}
