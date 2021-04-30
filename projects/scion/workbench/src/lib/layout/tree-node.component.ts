/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Input } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { ViewPartComponent } from '../view-part/view-part.component';
import { WorkbenchViewPartRegistry } from '../view-part/workbench-view-part.registry';
import { MPart, MTreeNode } from './parts-layout.model';
import { WorkbenchRouter } from '../routing/workbench-router.service';

/**
 * Visual representation of a {@link MTreeNode} in {@link PartsLayout}.
 */
@Component({
  selector: 'wb-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
})
export class TreeNodeComponent {

  private _treeNode!: MTreeNode;

  public sash1!: Sash;
  public sash2!: Sash;

  @Input()
  public set treeNode(treeNode: MTreeNode) {
    this._treeNode = treeNode;

    const [size1, size2] = computeSashProportions(treeNode.ratio);
    this.sash1 = this.createSash(treeNode.child1, size1);
    this.sash2 = this.createSash(treeNode.child2, size2);
  }

  constructor(private _wbRouter: WorkbenchRouter,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _workbenchLayout: WorkbenchLayoutService) {
  }

  public get nodeId(): string {
    return this._treeNode.nodeId;
  }

  public get direction(): 'column' | 'row' {
    return this._treeNode.direction;
  }

  public onSashStart(): void {
    this._workbenchLayout.notifyDragStarting();
  }

  public onSashEnd([sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayout.notifyDragEnding();
    this._wbRouter.ɵnavigate(layout => layout.setSplitRatio(this._treeNode.nodeId, ratio)).then();
  }

  private createSash(content: MTreeNode | MPart, proportion: string): Sash {
    return {
      portal: content instanceof MPart ? this._viewPartRegistry.getElseThrow(content.partId).portal : undefined,
      treeNode: content instanceof MTreeNode ? content : undefined,
      proportion: proportion,
    };
  }
}

/**
 * Computes the two sash proportions for the given ratio. Each proportion is >= 1.
 */
function computeSashProportions(ratio: number): [string, string] {
  // Important: `SciSashboxComponent` requires proportions to be >= 1.
  // For that reason, we cannot simply compute [ratio, 1 - ratio].
  if (ratio === 0) {
    return ['0px', '1'];
  }
  if (ratio === 1) {
    return ['1', '0px'];
  }

  return [`${1 / (1 - ratio)}`, `${1 / ratio}`];
}

export interface Sash {
  treeNode?: MTreeNode;
  portal?: WbComponentPortal<ViewPartComponent>;
  proportion: string;
}
