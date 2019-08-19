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
import { ViewDragService, ViewMoveEvent } from '../view-dnd/view-drag.service';
import { InternalWorkbenchService } from '../workbench.service';
import { UrlSegment } from '@angular/router';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';

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

  constructor(private _workbench: InternalWorkbenchService,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _viewDragService: ViewDragService,
              private _cd: ChangeDetectorRef) {
    this.installViewMoveListener();
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

  private installViewMoveListener(): void {
    const appInstanceId = this._workbench.appInstanceId;

    this._viewDragService.viewMove$
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: ViewMoveEvent) => {
        // Check if this app instance takes part in the view drag operation. If not, do nothing.
        if (event.source.appInstanceId !== appInstanceId && event.target.appInstanceId !== appInstanceId) {
          return;
        }

        const crossAppInstanceViewDrag = (event.source.appInstanceId !== event.target.appInstanceId);

        // Check if the user dropped the viewtab at the same location. If so, do nothing.
        if (!crossAppInstanceViewDrag && event.source.viewPartRef === event.target.viewPartRef && event.target.viewPartRegion === 'center') {
          return;
        }

        // Check if to remove the view from this app instance if being moved to another app instance.
        if (crossAppInstanceViewDrag && event.source.appInstanceId === appInstanceId) {
          this.removeView(event);
        }
        // Check if to add the view to this app instance if being moved from another app instance to this app instance.
        else if (crossAppInstanceViewDrag && event.target.appInstanceId === appInstanceId) {
          this.addView(event);
        }
        // Move the view within the same app instance.
        else {
          this.moveView(event);
        }
      });
  }

  private addView(event: ViewMoveEvent): void {
    const addToNewViewPart = (event.target.viewPartRegion || 'center') !== 'center';

    // Transform URL segments into an array of commands.
    const commands = event.source.viewUrlSegments.reduce((acc: any[], segment: UrlSegment) => {
      return acc.concat(
        segment.path || [],
        segment.parameters && Object.keys(segment.parameters).length ? segment.parameters : [],
      );
    }, []);

    if (addToNewViewPart) {
      const newViewRef = this._viewRegistry.computeNextViewOutletIdentity();
      const newViewPartRef = this._viewPartRegistry.grid.computeNextViewPartIdentity();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewRef, commands},
        viewGrid: this._viewPartRegistry.grid
          .addSiblingViewPart(event.target.viewPartRegion, event.target.viewPartRef, newViewPartRef)
          .addView(newViewPartRef, newViewRef)
          .serialize(),
      }).then();
    }
    else {
      const newViewRef = this._viewRegistry.computeNextViewOutletIdentity();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewRef, commands},
        viewGrid: this._viewPartRegistry.grid
          .addView(event.target.viewPartRef, newViewRef, event.target.insertionIndex)
          .serialize(),
      }).then();
    }
  }

  private removeView(event: ViewMoveEvent): void {
    this._workbench.destroyView(event.source.viewRef).then();
  }

  private moveView(event: ViewMoveEvent): void {
    const addToNewViewPart = (event.target.viewPartRegion || 'center') !== 'center';
    const grid = this._viewPartRegistry.grid;

    if (addToNewViewPart) {
      const newViewPartRef = grid.computeNextViewPartIdentity();
      this._viewOutletNavigator.navigate({
        viewGrid: grid
          .addSiblingViewPart(event.target.viewPartRegion, event.target.viewPartRef, newViewPartRef)
          .moveView(event.source.viewRef, newViewPartRef)
          .serialize(),
      }).then();
    }
    else {
      this._viewOutletNavigator.navigate({
        viewGrid: grid
          .moveView(event.source.viewRef, event.target.viewPartRef, event.target.insertionIndex)
          .serialize(),
      }).then();
    }
  }
}
