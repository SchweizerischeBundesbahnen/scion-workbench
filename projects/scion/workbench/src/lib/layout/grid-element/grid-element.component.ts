/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Input, OnChanges, SimpleChanges, TrackByFunction} from '@angular/core';
import {MPart, MTreeNode} from '../workbench-layout.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchLayoutService} from '../workbench-layout.service';
import {InstanceofPipe} from '../../common/instanceof.pipe';
import {PortalModule} from '@angular/cdk/portal';
import {PartPortalPipe} from '../../part/part-portal.pipe';
import {NgFor, NgIf} from '@angular/common';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {isGridElementVisible} from '../ɵworkbench-layout';

/**
 * Renders a {@link MTreeNode} or {@link MPart}.
 *
 * The workbench layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`.
 * Each node has two children, which can be either another node or a part (leaf). A node defines
 * a split layout in which the two children are arranged vertically or horizontally.
 *
 * Nodes are rendered as {@link SciSashboxComponent} and parts as {@link PartComponent} or
 * {@link MainAreaLayoutComponent}.
 *
 * @see WorkbenchLayoutComponent
 */
@Component({
  selector: 'wb-grid-element',
  templateUrl: './grid-element.component.html',
  styleUrls: ['./grid-element.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    InstanceofPipe,
    PortalModule,
    PartPortalPipe,
    SciSashboxComponent,
    SciSashDirective,
  ],
})
export class GridElementComponent implements OnChanges {

  public MTreeNode = MTreeNode;
  public MPart = MPart;

  public children = new Array<ChildElement>();

  @HostBinding('attr.data-parentnodeid')
  public parentNodeId: string | undefined;

  @HostBinding('attr.data-nodeid')
  public nodeId: string | undefined;

  @HostBinding('attr.data-partid')
  public partId: string | undefined;

  @Input({required: true})
  public element!: MTreeNode | MPart;

  constructor(private _workbenchRouter: WorkbenchRouter, private _workbenchLayoutService: WorkbenchLayoutService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.children = this.element instanceof MTreeNode ? this.computeChildren(this.element) : [];
    this.parentNodeId = this.element.parent?.nodeId;
    this.nodeId = this.element instanceof MTreeNode ? this.element.nodeId : undefined;
    this.partId = this.element instanceof MPart ? this.element.id : undefined;
  }

  public onSashStart(): void {
    this._workbenchLayoutService.notifyDragStarting();
  }

  public onSashEnd(treeNode: MTreeNode, [sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayoutService.notifyDragEnding();
    this._workbenchRouter.ɵnavigate(layout => layout.setSplitRatio(treeNode.nodeId, ratio)).then();
  }

  private computeChildren(treeNode: MTreeNode): ChildElement[] {
    const child1Visible = isGridElementVisible(treeNode.child1);
    const child2Visible = isGridElementVisible(treeNode.child2);

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
  }

  /**
   * Each layout change creates new model object instances since the layout is deserialized from the URL.
   * Therefore, the "correct" track-by function is critical to help Angular identify DOM elements for reuse, which significantly can
   * improve performance. Note that we use the index instead of the object identity because a different identity may be computed for
   * nodes when re-arranging parts. Using the index is like not using *ngFor at all.
   */
  public indexTrackByFn: TrackByFunction<ChildElement> = (index: number): number => index;
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
