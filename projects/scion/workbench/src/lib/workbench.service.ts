/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { WorkbenchViewPartService } from './view-part/workbench-view-part.service';
import { ViewPartGridUrlObserver } from './view-part-grid/view-part-grid-url-observer.service';
import { VIEW_GRID_QUERY_PARAM } from './workbench.constants';
import { Router } from '@angular/router';

/**
 * Root object for the SCION Workbench.
 *
 * It consists of one or more viewparts containing views which can be flexible arranged and dragged around by the user.
 *
 * The Workbench provides core features of a modern rich web application.
 *
 * - tabbed, movable and stackable views
 * - activity panel as application entry point
 * - global notifications
 * - global or view-local message boxes
 * - URL encoded navigational state
 *
 * Activities are modelled in `app.component.html` as content children of <wb-workbench> in the form of <wb-activity> elements.
 *
 * Views are opened via Angular routing mechanism. To open a component in a view, it has to be registered as a route in the routing module.
 * Use `wbRouterLink` directive or `WorkbenchRouter` service for view-based navigation.
 */
export abstract class WorkbenchService {

  /**
   * Destroys the specified workbench view(s) and associated routed component.
   * If it is the last view in the viewpart, the viewpart is removed as well.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract destroyView(...viewRefs: string[]): Promise<boolean>;

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract activateView(viewRef: string): Promise<boolean>;

  /**
   * Returns the identity of the viewpart which contains the specified view.
   *
   * Throws an error if no viewpart contains the view.
   */
  public abstract resolveViewPart(viewRef: string): string;
}


@Injectable()
export class InternalWorkbenchService implements WorkbenchService {

  private _activeViewPartService: WorkbenchViewPartService;
  private _viewPartServices: WorkbenchViewPartService[] = [];

  constructor(private _viewPartGridUrlObserver: ViewPartGridUrlObserver, private _router: Router) {
  }

  public destroyView(...viewRefs: string[]): Promise<boolean> {
    const destroyViewFn = (viewRef: string): Promise<boolean> => {
      const serializedGrid = this._viewPartGridUrlObserver.snapshot
        .removeView(viewRef)
        .serialize();
      return this._router.navigate([{outlets: {[viewRef]: null}}], {
        queryParams: {[VIEW_GRID_QUERY_PARAM]: serializedGrid},
        queryParamsHandling: 'merge'
      });
    };

    // Use a separate navigate command to remove each view separately. Otherwise, if a view would reject destruction,
    // no view would be removed at all. Also, removal must be done sequentially to have a proper grid snapshot.
    return viewRefs.reduce((prevDestroyPromise, viewRef) => {
      return prevDestroyPromise.then(() => destroyViewFn(viewRef));
    }, Promise.resolve(true));
  }

  public activateView(viewRef: string): Promise<boolean> {
    return this.resolveViewPartServiceElseThrow(viewRef).activateView(viewRef);
  }

  public resolveViewPart(viewRef: string): string {
    return this.resolveViewPartServiceElseThrow(viewRef).viewPartRef;
  }

  private resolveViewPartServiceElseThrow(viewRef: string): WorkbenchViewPartService | null {
    const viewPartService = this._viewPartServices.find(it => it.containsView(viewRef));
    if (!viewPartService) {
      throw Error(`No ViewPartService for View found [view=${viewRef}]`);
    }
    return viewPartService;
  }

  public registerViewPartService(viewPartService: WorkbenchViewPartService): void {
    this._viewPartServices.push(viewPartService);
  }

  public unregisterViewPartService(viewPartService: WorkbenchViewPartService): void {
    const index = this._viewPartServices.indexOf(viewPartService);
    this._viewPartServices.splice(index, 1);
    if (viewPartService === this.activeViewPartService) {
      this.activeViewPartService = this._viewPartServices[index] || this._viewPartServices[this._viewPartServices.length - 1];
    }
  }

  /**
   * Sets the active viewpart service for this workbench.
   */
  public set activeViewPartService(viewPart: WorkbenchViewPartService) {
    this._activeViewPartService = viewPart;
  }

  /**
   * Returns the currently active viewpart service for this workbench.
   */
  public get activeViewPartService(): WorkbenchViewPartService {
    if (!this._activeViewPartService) {
      throw Error('No active ViewPart');
    }
    return this._activeViewPartService;
  }
}
