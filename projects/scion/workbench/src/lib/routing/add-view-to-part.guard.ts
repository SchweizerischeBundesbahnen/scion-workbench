/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, CanActivate, Params, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PARTS_LAYOUT_QUERY_PARAM, NAVIGATION_EXTRAS} from '../workbench.constants';
import {PartsLayout} from '../layout/parts-layout';
import {WbNavigationExtras, WorkbenchRouter} from '../routing/workbench-router.service';
import {RouterUtils} from './router.util';
import {WorkbenchRouteData} from './workbench-route-data';

/**
 * Guard for adding a view to a part.
 *
 * We use a guard for adding views to parts in order to read a view's preferred part from its resolved route data.
 *
 * If the view is not yet added to the layout, a view's part is resolved as follows:
 *
 * 1. Adds the view to its preferred part as specified in its route data, if defined.
 * 2. Adds the views to the currently active part.
 */
@Injectable()
export class WbAddViewToPartGuard implements CanActivate {

  constructor(private _router: Router, private _workbenchRouter: WorkbenchRouter) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const viewId: string = route.outlet;

    // Read the layout from the URL.
    const partsLayout = this._workbenchRouter.getCurrentNavigationContext().partsLayout;

    // Return if the view is already added to the layout.
    if (partsLayout.findPartByViewId(viewId, {orElseThrow: false})) {
      return true;
    }

    // Add the view to its preferred part, if any, or to the currently active part otherwise.
    const partId = this.getPreferredPartId(route, partsLayout) || partsLayout.activePart.partId;
    const extras: WbNavigationExtras | undefined = (this._workbenchRouter.getCurrentNavigationViewState(viewId) || {})[NAVIGATION_EXTRAS];
    const viewInsertionIndex = partsLayout.computeViewInsertionIndex(extras?.blankInsertionIndex, partId);
    const partsLayoutSerialized = partsLayout
      .addView(partId, viewId, {position: viewInsertionIndex, activate: extras?.activate})
      .serialize();

    return this.createUrlTree(state.url, {
      queryParams: {[PARTS_LAYOUT_QUERY_PARAM]: partsLayoutSerialized},
    });
  }

  private getPreferredPartId(route: ActivatedRouteSnapshot, partsLayout: PartsLayout): string | null {
    const actualRouteSnapshot = RouterUtils.resolveActualRouteSnapshot(route);
    const preferredPartId = RouterUtils.lookupRouteData<string>(actualRouteSnapshot, WorkbenchRouteData.part);
    if (!preferredPartId) {
      return null;
    }

    // Check if the layout contains the preferred part
    const preferredPart = partsLayout.findPart(preferredPartId, {orElseThrow: false});
    if (!preferredPart) {
      throw Error(`[ViewPreferredPartError] Cannot find the view's preferred part '${preferredPartId}' as specified in its route config '${route.routeConfig}'. Did you forget to add the part to the layout?`);
    }
    return preferredPart.partId;
  }

  private createUrlTree(url: string, extras: {queryParams: Params}): UrlTree {
    const urlTree: UrlTree = this._router.parseUrl(url);
    urlTree.queryParams = {...urlTree.queryParams, ...extras.queryParams};
    return urlTree;
  }
}
