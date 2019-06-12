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
import { WorkbenchViewPartRegistry } from './workbench-view-part-registry.service';
import { VIEW_PART_REF_INDEX, ViewPartInfoArray, ViewPartSashBox } from './view-part-grid-serializer.service';
import { ViewPartComponent } from '../view-part/view-part.component';
import { noop, Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ViewPartGrid, ViewPartGridNode } from './view-part-grid.model';

/**
 * Allows the arrangement of viewparts in a grid.
 *
 * The grid is a tree of nested sash boxes and viewpart portals.
 * A sash box is the container for two sashes, which itself is either a portal or a sash box, respectively.
 */
@Component({
  selector: 'wb-view-part-grid',
  templateUrl: './view-part-grid.component.html',
  styleUrls: ['./view-part-grid.component.scss'],
})
export class ViewPartGridComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  /**
   * Reference to the root grid node, which is either a sashbox or a viewpart.
   *
   * @see viewPartPortal
   * @see sashBox
   */
  public root: ViewPartSashBox | ViewPartInfoArray;

  /**
   * Reference to the root viewpart of the grid, or 'null' if having a nested grid.
   */
  public viewPartPortal: WbComponentPortal<ViewPartComponent>;

  /**
   * Reference to the root sash box of the grid, or 'null' if not having a nested grid.
   */
  public sashBox: ViewPartSashBox;

  constructor(private _viewPartRegistry: WorkbenchViewPartRegistry, private _cd: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._viewPartRegistry.grid$
      .pipe(
        startWith(null as ViewPartGrid), // start with a null grid to initialize the 'pairwise' operator, so it emits once the grid is set.
        pairwise(),
        takeUntil(this._destroy$),
      )
      .subscribe(([prevGrid, currGrid]: [ViewPartGrid, ViewPartGrid]) => {
        // Determine the portals which are about to be re-parented in the DOM, and detach them temporarily from Angular component tree,
        // so they are not destroyed while being re-parented.
        const reattachFn = this.detachPortalsToBeMovedFromComponentTree(prevGrid, currGrid);

        // Set the new grid.
        this.root = currGrid.root;
        this.sashBox = !Array.isArray(this.root) ? this.root : null;
        this.viewPartPortal = Array.isArray(this.root) ? this._viewPartRegistry.getElseThrow(this.root[VIEW_PART_REF_INDEX]).portal : null;

        // Trigger a change detection cycle to flush the new grid to the DOM.
        this._cd.detectChanges();

        // Re-attach detached portals.
        reattachFn();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * Determines the portals which are about to be re-parented in the DOM, and detaches them from Angular component tree,
   * so they are not destroyed while being re-parented.
   *
   * Returns a function to attach the detached portals to the Angular component tree anew.
   */
  private detachPortalsToBeMovedFromComponentTree(prevGrid: ViewPartGrid, newGrid: ViewPartGrid): () => void {
    if (!prevGrid) {
      return noop; // no current grid in place, so no portal is moved
    }

    // Function to compute the path of a ViewPart to its root sash box
    const computePathToRootFn = (node: ViewPartGridNode): string => {
      return node.path.map(it => it.id).join(',');
    };

    // Compute all ViewPart root paths of the new grid
    const newViewPartRootPaths = new Map<string, string>();
    newGrid.visit((newNode: ViewPartGridNode): boolean => {
      newViewPartRootPaths.set(newNode.viewPartRef, computePathToRootFn(newNode));
      return true;
    });

    // Compare ViewPart root paths of the current and the new grid.
    // If the path changed, the portal will be moved and is therefore detached from Angular component tree.
    const portalsToBeMoved: WbComponentPortal<any>[] = [];
    prevGrid.visit((prevNode: ViewPartGridNode): boolean => {
      const prevPathToRoot = computePathToRootFn(prevNode);
      const newPathToRoot = newViewPartRootPaths.get(prevNode.viewPartRef);

      if (newPathToRoot !== prevPathToRoot) {
        const viewPart = this._viewPartRegistry.getElseThrow(prevNode.viewPartRef);
        portalsToBeMoved.push(viewPart.portal);
      }
      return true;
    });

    portalsToBeMoved.forEach(portal => portal.detach());
    return (): void => portalsToBeMoved.forEach(portal => portal.attach());
  }
}
