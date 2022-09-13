/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {WorkbenchViewPartRegistry} from '../view-part/workbench-view-part.registry';
import {ViewPartComponent} from '../view-part/view-part.component';
import {Subject} from 'rxjs';
import {pairwise, startWith, takeUntil} from 'rxjs/operators';
import {PartsLayout} from './parts-layout';
import {MPart, MTreeNode} from './parts-layout.model';
import {WorkbenchLayoutService} from './workbench-layout.service';

/**
 * Represents the arrangement of parts. Each part contains one or more views.
 *
 * The layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`.
 * Each node has two children, which can either be another node or a leaf part. A node
 * defines a split layout in which the two children are arranged vertically or horizontally.
 *
 * Nodes are rendered as {@link SciSashboxComponent} and parts as {@link ViewPartComponent}.
 *
 *
 *                MTreeNode                       +--------+-------+
 *                   |                            |  left  | right |
 *                   |                            |  top   | main  |
 *          +--------+--------+         ======>   |--------+       |
 *          |                 |         renders   |  left  |       |
 *      MTreeNode           MPart                 | bottom |       |
 *     +------+------+     (right)                +--------+-------+
 *     |             |
 *   MPart         MPart
 * (left-top)  (left-bottom)
 *
 */
@Component({
  selector: 'wb-parts-layout',
  templateUrl: './parts-layout.component.html',
  styleUrls: ['./parts-layout.component.scss'],
})
export class PartsLayoutComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  public root!: MTreeNode | MPart;

  /**
   * Reference to the root part of the layout. Is only set if the layout root is of the type {@link MPart}.
   */
  public rootPart: WbComponentPortal<ViewPartComponent> | null = null;

  /**
   * Reference to the root node of the layout. Is only set if the layout root is of the type {@link MTreeNode}.
   */
  public rootNode: MTreeNode | null = null;

  constructor(private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _cd: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._workbenchLayoutService.layout$
      .pipe(
        startWith(null! as PartsLayout), // start with a null layout to initialize the 'pairwise' operator, so it emits once the layout is set.
        pairwise(),
        takeUntil(this._destroy$),
      )
      .subscribe(([prevLayout, curLayout]: [PartsLayout | null, PartsLayout]) => {
        // Detach parts which are about to be re-parented in the DOM during re-layout so that they are not destroyed.
        this.detachPartsToBeReparented(prevLayout, curLayout);

        // Apply the new layout.
        this.root = curLayout.root;
        this.rootNode = this.root instanceof MTreeNode ? this.root : null;
        this.rootPart = this.root instanceof MPart ? this._viewPartRegistry.getElseThrow(this.root.partId).portal : null;

        // Trigger a change detection cycle to flush the new layout to the DOM.
        this._cd.detectChanges();
      });
  }

  /**
   * Detaches parts which are about to be re-parented in the DOM during re-layout so that they are not destroyed.
   */
  private detachPartsToBeReparented(prevLayout: PartsLayout | null, currLayout: PartsLayout): void {
    if (!prevLayout) {
      return;
    }

    // Determine and detach parts which are about to be moved in the layout tree.
    const currPartsById = new Map(currLayout.parts.map(part => [part.partId, part]));
    prevLayout.parts.forEach(prevPart => {
      const currentPart = currPartsById.get(prevPart.partId);
      // If the part is moved in the layout, detach it.
      if (currentPart && currentPart.getPath().length !== prevPart.getPath().length) {
        this._viewPartRegistry.getElseThrow(prevPart.partId).portal.detach();
      }
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
