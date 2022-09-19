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
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchRouteData} from './workbench-route-data';

/**
 * Makes navigational state available to the activated route via {@link ActivatedRoute#data} under the key {@link WorkbenchRouteData.state}.
 *
 * We read the navigation state from {@link WorkbenchRouter#getCurrentNavigationViewState} instead of {@link Router#getCurrentNavigation#extras}
 * because the Angular router discards passed state if a guard performs a redirect. See Angular issue https://github.com/angular/angular/issues/27148.
 *
 * Depending on the route configuration, the Angular router invokes this resolver also if only query parameters change.
 * See {@link Route#runGuardsAndResolvers}. Then, we resolve to the current state of the activated route.
 *
 * Note that Angular performs a reference equality check to decide whether resolved data has changed. For that reason, we resolve to `undefined` if the
 * state object is empty.
 */
@Injectable({providedIn: 'root'})
export class NavigationStateResolver implements Resolve<Dictionary | undefined | null> {

  constructor(private _workbenchRouter: WorkbenchRouter, private _router: Router) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Dictionary | undefined | null {
    const outletName = route.outlet;
    const outletState = this._workbenchRouter.getCurrentNavigationViewState(outletName) || this.findActivatedRoute(outletName)?.data?.[WorkbenchRouteData.state];

    return undefinedIfEmpty(outletState);
  }

  private findActivatedRoute(outlet: string): ActivatedRouteSnapshot | undefined {
    return this._router.routerState.snapshot.root.children.find(it => it.outlet === outlet);
  }
}

/**
 * Returns `undefined` if the passed dictionary is empty or contains only `undefined` or empty object values.
 */
function undefinedIfEmpty(dictionary: Dictionary | undefined | null): Dictionary | null | undefined {
  if (dictionary === undefined || dictionary === null) {
    return dictionary;
  }
  if (!Object.keys(dictionary).length) {
    return undefined;
  }
  if (Object.values(dictionary).every(value => value === undefined || (typeof value === 'object' && !Object.keys(value).length))) {
    return undefined;
  }
  return dictionary;
}
