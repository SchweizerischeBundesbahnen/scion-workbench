/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { WorkbenchViewPartRegistry } from '../view-part/workbench-view-part.registry';
import { ViewPartComponent } from '../view-part/view-part.component';
import { noop, Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { PartsLayout } from './parts-layout';
import { MPart, MTreeNode } from './parts-layout.model';
import { Arrays } from '@scion/toolkit/util';
import { WorkbenchLayoutService } from './workbench-layout.service';

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

  public root: MTreeNode | MPart;

  /**
   * Reference to the root part of the layout. Is only set if the layout root is of the type {@link MPart}.
   */
  public rootPart: WbComponentPortal<ViewPartComponent>;

  /**
   * Reference to the root node of the layout. Is only set if the layout root is of the type {@link MTreeNode}.
   */
  public rootNode: MTreeNode;

  constructor(private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _layoutService: WorkbenchLayoutService,
              private _cd: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._layoutService.layout$
      .pipe(
        startWith(null as PartsLayout), // start with a null layout to initialize the 'pairwise' operator, so it emits once the layout is set.
        pairwise(),
        takeUntil(this._destroy$),
      )
      .subscribe(([prevLayout, curLayout]: [PartsLayout, PartsLayout]) => {
        // Determine the parts which are about to be re-parented in the DOM, and detach them temporarily from the Angular component tree,
        // so that they are not destroyed when being re-parented.
        const reattachFn = this.detachPortalsToBeMovedFromComponentTree(prevLayout, curLayout);

        // Set the new layout.
        this.root = curLayout.root;
        this.rootNode = this.root instanceof MTreeNode ? this.root : null;
        this.rootPart = this.root instanceof MPart ? this._viewPartRegistry.getElseThrow(this.root.partId).portal : null;

        // Trigger a change detection cycle to flush the new layout to the DOM.
        this._cd.detectChanges();

        // Re-attach detached parts.
        reattachFn();
      });
  }

  /**
   * Determines the portals which are about to be re-parented in the DOM, and detaches them from Angular component tree,
   * so they are not destroyed while being re-parented.
   *
   * Returns a function to attach the detached portals to the Angular component tree anew.
   */
  private detachPortalsToBeMovedFromComponentTree(prevLayout: PartsLayout, newLayout: PartsLayout): () => void {
    if (!prevLayout) {
      return noop; // no current layout in place, so no portal is moved
    }

    // For each part, compute its path in the layout tree. The path is the list of all parent node ids.
    const newPartPaths: Map<string, string[]> = newLayout.parts.reduce((acc, part) => {
      return acc.set(part.partId, part.getPath());
    }, new Map<string, string[]>());

    // Determine parts to be moved in the layout tree.
    const partPortalsToBeMoved: WbComponentPortal<ViewPartComponent>[] = prevLayout.parts.reduce((acc, prevPart) => {
      const prevPartPath = prevPart.getPath();
      const newPartPath = newPartPaths.get(prevPart.partId);

      if (!Arrays.isEqual(newPartPath, prevPartPath)) {
        return acc.concat(this._viewPartRegistry.getElseThrow(prevPart.partId).portal);
      }
      return acc;
    }, [] as WbComponentPortal<ViewPartComponent>[]);

    // Detach parts from the Angular component tree that are to be moved in the layout tree.
    // Detaching those parts prevents them from being disposed during re-rendering the layout.
    partPortalsToBeMoved.forEach(portal => portal.detach());

    // Return a function for re-attaching the moved parts to the Angular component tree.
    return (): void => partPortalsToBeMoved.forEach(portal => portal.attach());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
