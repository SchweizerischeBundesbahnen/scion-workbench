/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, CanActivate, Params, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PARTS_LAYOUT_QUERY_PARAM, VIEW_TARGET} from '../workbench.constants';
import {PartsLayout} from '../layout/parts-layout';
import {ViewTarget, WorkbenchRouter} from '../routing/workbench-router.service';

/**
 * Guard for adding a view to a part.
 *
 * We use a guard for adding views to parts in order to read a view's preferred part from its resolved route data.
 *
 * If the view is not yet added to the layout, a view's part is resolved as follows:
 *
 * 1. Adds the view to the part as specified in the navigation state, if set.
 * 2. Adds the view to its preferred part as specified in its route data, if defined.
 * 3. Adds the views to the currently active part.
 */
@Injectable()
export class WbAddViewToPartGuard implements CanActivate {

  constructor(private _router: Router, private _workbenchRouter: WorkbenchRouter) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const viewId: string = route.outlet;
    const viewTarget: ViewTarget | undefined = (this._workbenchRouter.getCurrentNavigationViewState(viewId) || {})[VIEW_TARGET];

    // Read the layout from the URL.
    const partsLayout = this._workbenchRouter.getCurrentNavigationContext().partsLayout;

    // Return if the view is already added to the layout.
    if (partsLayout.findPartByViewId(viewId, {orElseThrow: false})) {
      return true;
    }

    // Add the view to the part specified in the navigation state, or its preferred part, or to the currently active part.
    const partId = viewTarget?.partId || this.getPreferredPartId(route, partsLayout) || partsLayout.activePart.partId;
    const viewInsertionIndex = this.coerceViewInsertionIndex(viewTarget?.viewIndex, partId, partsLayout);
    const partsLayoutSerialized = partsLayout
      .addView(partId, viewId, viewInsertionIndex)
      .serialize();

    return this.createUrlTree(state.url, {
      queryParams: {[PARTS_LAYOUT_QUERY_PARAM]: partsLayoutSerialized},
    });
  }

  private getPreferredPartId(route: ActivatedRouteSnapshot, partsLayout: PartsLayout): string | null {
    const preferredPartId = route.data['part'];
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

  /**
   * Computes the index for 'start' or 'last' literals, or coerces the index to a number.
   * If `undefined` is given as insertion index, it returns the position after the currently active view.
   */
  private coerceViewInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined, partId: string, partsLayout: PartsLayout): number {
    switch (insertionIndex) {
      case undefined: {  // index after the active view, if any, or after the last view otherwise
        const part = partsLayout.findPart(partId, {orElseThrow: true});
        const index = part.viewIds.indexOf(part.activeViewId!);
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
