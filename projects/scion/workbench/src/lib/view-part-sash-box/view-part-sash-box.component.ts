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
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { ViewPartComponent } from '../view-part/view-part.component';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { PartsLayoutProvider } from '../view-part-grid/view-part-grid-provider.service';
import { Part, TreeNode } from '../layout/parts-layout.model';

/**
 * Visual representation of a {@link TreeNode} in {@link PartsLayout}.
 */
@Component({
  selector: 'wb-view-part-sash-box',
  templateUrl: './view-part-sash-box.component.html',
  styleUrls: ['./view-part-sash-box.component.scss'],
})
export class ViewPartSashBoxComponent {

  private _treeNode: TreeNode;

  public sash1: Sash;
  public sash2: Sash;

  @Input()
  public set treeNode(treeNode: TreeNode) {
    this._treeNode = treeNode;
    this.sash1 = this.createSash(treeNode.child1, treeNode.ratio);
    this.sash2 = this.createSash(treeNode.child2, 1 - treeNode.ratio);
  }

  constructor(private _viewOutletNavigator: ViewOutletNavigator,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _partsLayoutProvider: PartsLayoutProvider,
              private _workbenchLayout: WorkbenchLayoutService) {
  }

  public get nodeId(): string {
    return this._treeNode.nodeId;
  }

  public get direction(): 'column' | 'row' {
    return this._treeNode.direction;
  }

  public onSashStart(): void {
    this._workbenchLayout.viewSashDrag$.next('start');
  }

  public onSashEnd(sashSizes: (string | number)[]): void {
    // assert sash sizes to be a fraction and not a fixed size
    sashSizes.forEach(sashSize => {
      if (typeof sashSize !== 'number') {
        throw Error(`[IllegalSashSizeError] Sash size expected to be a fraction [actual=${sashSize}]`);
      }
    });

    const sashSize1 = sashSizes[0] as number;
    const sashSize2 = sashSizes[1] as number;
    const ratio = sashSize1 / (sashSize1 + sashSize2);

    this._workbenchLayout.viewSashDrag$.next('end');

    const serializedLayout = this._partsLayoutProvider.layout
      .setNodeSplitterPosition(this._treeNode.nodeId, ratio)
      .serialize();
    this._viewOutletNavigator.navigate({partsLayout: serializedLayout}).then();
  }

  private createSash(content: TreeNode | Part, size: number): Sash {
    return {
      portal: content instanceof Part ? this._viewPartRegistry.getElseThrow(content.partId).portal : null,
      treeNode: content instanceof TreeNode ? content : null,
      size: Math.max(1, size * 1000000), // the proportion for flexible sized sashes must be >=1
    };
  }
}

export interface Sash {
  treeNode?: TreeNode;
  portal?: WbComponentPortal<ViewPartComponent>;
  size: number;
}
