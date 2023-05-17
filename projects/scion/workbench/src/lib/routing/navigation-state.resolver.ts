/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Dictionary} from '@scion/toolkit/util';
import {WorkbenchRouteData} from './workbench-route-data';
import {WorkbenchNavigationalState, WorkbenchNavigationalStates} from './workbench-navigational-states';

/**
 * Makes navigational state available to the activated route via {@link ActivatedRoute#data} under the key {@link WorkbenchRouteData.state}.
 *
 * Depending on the route configuration, the Angular router runs this resolver on every navigation. See {@link Route#runGuardsAndResolvers}. Then,
 * we resolve to the current state of the activated route.
 *
 * Note that Angular performs a reference equality check to decide whether resolved data has changed. For that reason, we resolve to `undefined` if the
 * state object is empty.
 */
@Injectable({providedIn: 'root'})
export class NavigationStateResolver implements Resolve<Dictionary | undefined | null> {

  constructor(private _router: Router) {
  }

  public resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Dictionary | undefined | null {
    const navigationalViewState = this.getNavigationalViewState(route.outlet);
    return isEmpty(navigationalViewState) ? undefined : navigationalViewState;
  }

  private getNavigationalViewState(viewId: string): WorkbenchNavigationalState | undefined {
    const navigationalViewState = WorkbenchNavigationalStates.fromNavigation(this._router.getCurrentNavigation()!)?.viewStates?.[viewId];
    if (navigationalViewState) {
      return navigationalViewState;
    }
    return this.findActivatedRoute(viewId)?.data?.[WorkbenchRouteData.state];
  }

  private findActivatedRoute(outlet: string): ActivatedRouteSnapshot | undefined {
    return this._router.routerState.snapshot.root.children.find(it => it.outlet === outlet);
  }
}

/**
 * Tests whether the passed dictionary is empty or contains only `undefined` or empty object values.
 */
function isEmpty(dictionary: Dictionary | undefined | null): boolean {
  if (dictionary === undefined || dictionary === null) {
    return true;
  }
  if (!Object.keys(dictionary).length) {
    return true;
  }
  if (Object.values(dictionary).every(value => value === undefined || (typeof value === 'object' && !Object.keys(value).length))) {
    return true;
  }
  return false;
}
