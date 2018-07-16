/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, ComponentFactoryResolver, Injectable, Injector, IterableDiffers, OnDestroy } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { ViewPartComponent } from '../view-part/view-part.component';
import { delay, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PortalInjector } from '@angular/cdk/portal';
import { InternalWorkbenchViewPart, WorkbenchViewPart } from '../workbench.model';
import { ViewPartGridUrlObserver } from './view-part-grid-url-observer.service';
import { ViewPartGrid, ViewPartGridNode } from './view-part-grid.model';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';

/**
 * Controls the instantiation and disposal of workbench viewparts and manages the viewpart registry.
 */
@Injectable()
export class ViewPartGridService implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _viewPartRegistry = new Map<string, InternalWorkbenchViewPart>();

  public grid: ViewPartGrid;

  constructor(private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartGridUrlObserver: ViewPartGridUrlObserver,
              private _differs: IterableDiffers,
              private _injector: Injector,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _cd: ChangeDetectorRef,
              private _layoutService: WorkbenchLayoutService) {
    this.observeGridChanges();
  }

  private observeGridChanges(): void {
    const viewPartsDiffer = this._differs.find([]).create<string>();

    this._viewPartGridUrlObserver.observe$
      .pipe(
        delay(0), // process the grid after routing completed
        takeUntil(this._destroy$)
      )
      .subscribe((newGrid: ViewPartGrid) => {
        // Determine the portals which are re-parented in the DOM, and detach them from
        // Angular component tree, so they are not destroyed while being re-parented.
        const reattachFn = this.detachPortalsToBeMovedFromComponentTree(this.grid, newGrid);

        // Register and instantiate new ViewParts, and remove and destroy ViewParts which are no longer used
        const viewPartsChange = viewPartsDiffer.diff(newGrid.viewPartRefs());
        if (viewPartsChange) {
          viewPartsChange.forEachRemovedItem(({item}) => {
            this._viewPartRegistry.get(item).portal.destroy();
            this._viewPartRegistry.delete(item);
          });
          viewPartsChange.forEachAddedItem(({item}) => {
            this._viewPartRegistry.set(item, this.createWorkbenchViewPart(item));
          });
        }

        // Update ViewPart objects
        newGrid.visit((it: ViewPartGridNode): boolean => {
          const viewPart = this.resolveViewPartElseThrow(it.viewPartRef);
          viewPart.viewRefs = it.viewRefs;
          viewPart.activeViewRef = it.activeViewRef;
          return true;
        });

        // Install the new grid
        this.grid = newGrid;
        // Enforce a change detection cycle, so the grid is flushed to the DOM
        this._cd.detectChanges();
        // Re-attach portals since the effective grid is in place
        reattachFn && reattachFn();
        // Notify about layout change
        this._layoutService.afterGridChange$.next();
      });
  }

  private createWorkbenchViewPart(viewPartRef: string): InternalWorkbenchViewPart {
    const portal = new WbComponentPortal<ViewPartComponent>(this._componentFactoryResolver, ViewPartComponent);
    const viewPart = new InternalWorkbenchViewPart(viewPartRef, portal);

    const injectionTokens = new WeakMap();
    injectionTokens.set(WorkbenchViewPart, viewPart);
    injectionTokens.set(InternalWorkbenchViewPart, viewPart);
    portal.init({injector: new PortalInjector(this._injector, injectionTokens)});

    return viewPart;
  }

  public resolveViewPartElseThrow(viewPartRef: string): InternalWorkbenchViewPart {
    if (!viewPartRef) {
      throw Error('Illegal argument: blankViewPartRef must not be null');
    }

    const viewPart = this._viewPartRegistry.get(viewPartRef);
    if (!viewPart) {
      throw Error('Illegal state: viewpart not contained in viewpart registry');
    }
    return viewPart;
  }

  /**
   * Determines the portals which are re-parented in the DOM, and detaches them from Angular component tree,
   * so they are not destroyed while being re-parented.
   *
   * Returns a function to attach the detached portals to the Angular component tree anew.
   */
  private detachPortalsToBeMovedFromComponentTree(currentGrid: ViewPartGrid, newGrid: ViewPartGrid): () => void {
    if (!currentGrid) {
      return; // no current grid in place, so no portal is moved
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
    currentGrid.visit((currentNode: ViewPartGridNode): boolean => {
      const currentPathToRoot = computePathToRootFn(currentNode);
      const newPathToRoot = newViewPartRootPaths.get(currentNode.viewPartRef);
      const viewPart = this._viewPartRegistry.get(currentNode.viewPartRef);

      if (viewPart && newPathToRoot !== currentPathToRoot) {
        portalsToBeMoved.push(viewPart.portal, ...viewPart.viewRefs
          .map(viewRef => this._viewRegistry.getElseNull(viewRef))
          .filter(Boolean)
          .map(view => view.portal));
      }
      return true;
    });

    portalsToBeMoved.forEach(portal => portal.detach());
    return (): void => portalsToBeMoved.forEach(portal => portal.attach());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
