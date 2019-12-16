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
import { ViewPartComponent } from '../view-part/view-part.component';
import { noop, Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ViewDragService, ViewMoveEvent } from '../view-dnd/view-drag.service';
import { InternalWorkbenchService } from '../workbench.service';
import { Router, UrlSegment } from '@angular/router';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { PartsLayoutProvider } from './view-part-grid-provider.service';
import { LocationStrategy } from '@angular/common';
import { PartsLayout, regionToLayoutPosition } from '../layout/parts-layout';
import { Part, TreeNode } from '../layout/parts-layout.model';
import { Arrays, UUID } from '@scion/toolkit/util';
import { MAIN_PART_ID } from '../workbench.constants';

/**
 * Allows the arrangement of parts in a grid.
 *
 * The grid is a tree of nested sashboxes and part portals.
 * A sashbox is the container for two sashes, which itself is either a portal or a sash box, respectively.
 */
@Component({
  selector: 'wb-view-part-grid',
  templateUrl: './view-part-grid.component.html',
  styleUrls: ['./view-part-grid.component.scss'],
})
export class ViewPartGridComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  public root: TreeNode | Part;

  /**
   * Reference to the root part of the layout, if any.
   */
  public partPortal: WbComponentPortal<ViewPartComponent>;

  /**
   * Reference to the root tree node of the layout, if any.
   */
  public treeNode: TreeNode;

  constructor(private _workbench: InternalWorkbenchService,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _partsLayoutProvider: PartsLayoutProvider,
              private _viewDragService: ViewDragService,
              private _locationStrategy: LocationStrategy,
              private _router: Router,
              private _cd: ChangeDetectorRef) {
    this.installViewMoveListener();
  }

  public ngOnInit(): void {
    this._partsLayoutProvider.layout$
      .pipe(
        startWith(null as PartsLayout), // start with a null layout to initialize the 'pairwise' operator, so it emits once the layout is set.
        pairwise(),
        takeUntil(this._destroy$),
      )
      .subscribe(([prevLayout, curLayout]: [PartsLayout, PartsLayout]) => {
        // Determine the portals which are about to be re-parented in the DOM, and detach them temporarily from Angular component tree,
        // so they are not destroyed while being re-parented.
        const reattachFn = this.detachPortalsToBeMovedFromComponentTree(prevLayout, curLayout);

        // Set the new layout.
        this.root = curLayout.root;
        this.treeNode = this.root instanceof TreeNode ? this.root : null;
        this.partPortal = this.root instanceof Part ? this._viewPartRegistry.getElseThrow(this.root.partId).portal : null;

        // Trigger a change detection cycle to flush the new layout to the DOM.
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
  private detachPortalsToBeMovedFromComponentTree(prevLayout: PartsLayout, newLayout: PartsLayout): () => void {
    if (!prevLayout) {
      return noop; // no current layout in place, so no portal is moved
    }

    // Compute the paths to the root element of every part
    const newPartRootPaths = newLayout.parts.reduce((acc, part) => {
      return acc.set(part.partId, part.getPath());
    }, new Map<string, string[]>());

    // Compare ViewPart root paths of the current and the new layout.
    // If the path changed, the portal will be moved and is therefore detached from Angular component tree.
    const portalsToBeMoved = prevLayout.parts.reduce((acc, part) => {
      const prevPathToRoot = part.getPath();
      const newPathToRoot = newPartRootPaths.get(part.partId);

      if (!Arrays.isEqual(newPathToRoot, prevPathToRoot)) {
        acc.push(this._viewPartRegistry.getElseThrow(part.partId).portal);
      }
      return acc;
    }, [] as WbComponentPortal<any>[]);

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
        if (!crossAppInstanceViewDrag && event.source.partId === event.target.partId && event.target.region === 'center') {
          return;
        }

        // Check if to remove the view from this app instance if being moved to another app instance.
        if (crossAppInstanceViewDrag && event.source.appInstanceId === appInstanceId) {
          this.removeView(event);
          // Check if to add the view to a new browser window.
          if (event.target.appInstanceId === 'new') {
            this.addViewToNewWindow(event);
          }
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
    const addToNewViewPart = (event.target.region || 'center') !== 'center';

    // Transform URL segments into an array of commands.
    const commands = event.source.viewUrlSegments.reduce((acc: any[], segment: UrlSegment) => {
      return acc.concat(
        segment.path || [],
        segment.parameters && Object.keys(segment.parameters).length ? segment.parameters : [],
      );
    }, []);

    if (addToNewViewPart) {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewId, commands},
        partsLayout: this._partsLayoutProvider.layout
          .addPart(newPartId, {partId: event.target.partId, align: regionToLayoutPosition(event.target.region)}, {primary: event.source.primaryPart})
          .addView(newPartId, newViewId)
          .serialize(),
      }).then();
    }
    else {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewId, commands},
        partsLayout: this._partsLayoutProvider.layout
          .addView(event.target.partId, newViewId, event.target.insertionIndex)
          .serialize(),
      }).then();
    }
  }

  private addViewToNewWindow(event: ViewMoveEvent): void {
    const urlTree = this._viewOutletNavigator.createUrlTree({
      viewOutlet: this._viewRegistry.viewIds
        .filter(viewId => viewId !== event.source.viewId) // retain the source view outlet
        .map(viewId => ({name: viewId, commands: null})), // remove all other view outlets
      partsLayout: this._partsLayoutProvider.layout
        .removeParts()
        .addView(MAIN_PART_ID, event.source.viewId)
        .serialize(),
    });

    window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)));
  }

  private removeView(event: ViewMoveEvent): void {
    this._workbench.destroyView(event.source.viewId).then();
  }

  private moveView(event: ViewMoveEvent): void {
    const addToNewPart = (event.target.region || 'center') !== 'center';
    if (addToNewPart) {
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._viewOutletNavigator.navigate({
        partsLayout: this._partsLayoutProvider.layout
          .addPart(newPartId, {partId: event.target.partId, align: regionToLayoutPosition(event.target.region)}, {primary: event.source.primaryPart})
          .moveView(event.source.viewId, newPartId)
          .serialize(),
      }).then();
    }
    else {
      this._viewOutletNavigator.navigate({
        partsLayout: this._partsLayoutProvider.layout
          .moveView(event.source.viewId, event.target.partId, event.target.insertionIndex)
          .serialize(),
      }).then();
    }
  }
}
