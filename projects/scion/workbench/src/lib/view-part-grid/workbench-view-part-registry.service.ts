/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentFactoryResolver, Injectable, Injector, IterableDiffers } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortalInjector } from '@angular/cdk/portal';
import { InternalWorkbenchViewPart, WorkbenchViewPart } from '../workbench.model';
import { ViewPartGrid, ViewPartGridNode } from './view-part-grid.model';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { VIEW_PART_COMPONENT_TYPE } from '../workbench.constants';
import { filter } from 'rxjs/operators';

/**
 * Registry for {WorkbenchViewPart} objects.
 */
@Injectable()
export class WorkbenchViewPartRegistry {

  private readonly _viewPartRegistry = new Map<string, InternalWorkbenchViewPart>();
  private readonly _grid$ = new BehaviorSubject<ViewPartGrid>(null);

  constructor(private _differs: IterableDiffers,
              private _injector: Injector,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _layoutService: WorkbenchLayoutService) {
  }

  /**
   * Sets the given viewpart grid.
   */
  public setGrid(newGrid: ViewPartGrid): void {
    const prevGrid = this.grid;

    if (prevGrid && prevGrid.serialize() === newGrid.serialize()) {
      return; // no grid change
    }

    // Initialize a viewpart differ
    const viewPartsDiffer = this._differs.find([]).create<string>();
    prevGrid && viewPartsDiffer.diff(prevGrid.viewPartRefs());

    // Register new viewparts
    const viewPartsChange = viewPartsDiffer.diff(newGrid.viewPartRefs());
    viewPartsChange && viewPartsChange.forEachAddedItem(({item}) => {
      this._viewPartRegistry.set(item, this.createWorkbenchViewPart(item));
    });

    // Set viewpart properties
    newGrid.visit((newGridNode: ViewPartGridNode): boolean => {
      const viewPart = this.getElseThrow(newGridNode.viewPartRef);
      viewPart.viewRefs = newGridNode.viewRefs;
      viewPart.activeViewRef = newGridNode.activeViewRef;
      return true;
    });

    // Notify about the grid change
    this._grid$.next(newGrid);

    // Destroy viewparts which are no longer used.
    //
    // Important note:
    // Destroy viewparts after notifying about the grid change. Otherwise, moving of the last viewpart-view to another viewpart
    // would fail because the view would already be destroyed.
    viewPartsChange && viewPartsChange.forEachRemovedItem(({item}) => {
      this._viewPartRegistry.get(item).portal.destroy();
      this._viewPartRegistry.delete(item);
    });

    this._layoutService.afterGridChange$.next();
  }

  /**
   * Returns a reference to the viewpart grid, if any. Is `null` until the initial navigation is performed.
   */
  public get grid(): ViewPartGrid {
    return this._grid$.value;
  }

  /**
   * Emits the viewpart grid.
   *
   * Upon subscription, the current grid is emitted, if any, and then emits continuously when the grid changes. It never completes.
   */
  public get grid$(): Observable<ViewPartGrid> {
    return this._grid$.pipe(filter(Boolean));
  }

  private createWorkbenchViewPart(viewPartRef: string): InternalWorkbenchViewPart {
    const portal = new WbComponentPortal(this._componentFactoryResolver, this._injector.get(VIEW_PART_COMPONENT_TYPE));
    const viewPart = new InternalWorkbenchViewPart(viewPartRef, portal);

    const injectionTokens = new WeakMap();
    injectionTokens.set(WorkbenchViewPart, viewPart);
    injectionTokens.set(InternalWorkbenchViewPart, viewPart);
    portal.init({injector: new PortalInjector(this._injector, injectionTokens)});

    return viewPart;
  }

  /**
   * Returns the viewpart for the specified 'viewPartRef', or throws an Error if not found.
   */
  public getElseThrow(viewPartRef: string): InternalWorkbenchViewPart {
    const viewPart = this._viewPartRegistry.get(viewPartRef);
    if (!viewPart) {
      throw Error(`[IllegalStateError] viewpart '${viewPartRef}' not contained in the viewpart registry`);
    }
    return viewPart;
  }
}
