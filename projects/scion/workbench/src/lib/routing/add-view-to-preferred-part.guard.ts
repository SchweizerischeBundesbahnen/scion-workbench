/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ActivatedRouteSnapshot, CanActivate, Params, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PARTS_LAYOUT_QUERY_PARAM } from '../workbench.constants';
import { PartsLayout } from '../layout/parts-layout';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { WB_NAVIGATION_EXTRAS_STATE, WbNavigationExtras } from '../routing/workbench-router.service';

/**
 * If the view is not yet added to the layout, adds it to its preferred part as specified in its {@link Route}.
 * If the route is not configured to show in a preferred part, the view is added to the currently active primary part.
 */
@Injectable({providedIn: 'root'})
export class WbAddViewToPreferredPartGuard implements CanActivate {

  constructor(private _router: Router, private _viewRegistry: WorkbenchViewRegistry) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const partsLayout = new PartsLayout(this._viewRegistry, route.queryParams[PARTS_LAYOUT_QUERY_PARAM]);
    const viewId = route.outlet;

    // Return if the view is already part of the layout.
    if (partsLayout.findPartByViewId(viewId, {orElseThrow: false})) {
      return true;
    }

    const wbNavigationExtras: WbNavigationExtras = this._router.getCurrentNavigation().extras.state[WB_NAVIGATION_EXTRAS_STATE] || {};

    // Add the view to the preferred part, if defined by the route. Otherwise, add it to the currently active primary part.
    const partId = this.getPreferredPartId(route, partsLayout) || partsLayout.findActivePrimaryPart().partId;
    const viewInsertionIndex = this.coerceViewInsertionIndex(wbNavigationExtras.blankInsertionIndex, partId, partsLayout);
    const partsLayoutSerialized = partsLayout
      .addView(partId, viewId, viewInsertionIndex)
      .serialize();

    return this.createUrlTree(state.url, {
      queryParams: {[PARTS_LAYOUT_QUERY_PARAM]: partsLayoutSerialized},
    });
  }

  private getPreferredPartId(route: ActivatedRouteSnapshot, partsLayout: PartsLayout): string {
    const preferredPartId = route.data['part'];
    if (!preferredPartId) {
      return null;
    }

    // Check if the layout contains the preferred part
    const preferredPart = partsLayout.findPart(preferredPartId, {orElseThrow: false});
    if (!preferredPart) {
      throw Error(`[RouteConfigError] Cannot match layout part: '${preferredPartId}'. Did you forget to add the part to the layout? [route=${route.routeConfig}]`);
    }
    return preferredPart.partId;
  }

  private createUrlTree(url: string, extras: { queryParams: Params }): UrlTree {
    const urlTree: UrlTree = this._router.parseUrl(url);
    urlTree.queryParams = {...urlTree.queryParams, ...extras.queryParams};
    return urlTree;
  }

  /**
   * Computes the index for 'start' or 'last' literals, or coerces the index to a number.
   * If `undefined` is given as insertion index, it returns the position after the currently active view.
   */
  private coerceViewInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined, partId: string, partsLayout: PartsLayout): number {
    switch (insertionIndex) {
      case undefined: {  // index after the active view, if any, or after the last view otherwise
        const part = partsLayout.findPart(partId, {orElseThrow: true});
        const index = part.viewIds.indexOf(part.activeViewId);
        return (index > -1 ? index + 1 : part.viewIds.length);
      }
      case 'start': {
        return 0;
      }
      case 'end': {
        return partsLayout.findPart(partId, {orElseThrow: true}).viewIds.length;
      }
      default: {
        return insertionIndex;
      }
    }
  }

}
