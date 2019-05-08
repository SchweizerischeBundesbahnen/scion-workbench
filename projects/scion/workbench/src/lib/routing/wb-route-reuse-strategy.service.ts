/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Inject, Injectable, Optional } from '@angular/core';
import { ROUTE_REUSE_PROVIDER } from '../workbench.constants';

/**
 * Route reuse strategy which delegates to registered {WbRouteReuseProvider} objects
 * to control which routes to reuse. Multiple providers may coexist.
 *
 * SCION Workbench registers {WbActivityRouteReuseProvider} to reuse activity routes.
 *
 * Providers are registered under DI injection token {ROUTE_REUSE_PROVIDER} with 'multi' flag set to 'true'.
 */
@Injectable()
export class WbRouteReuseStrategy implements RouteReuseStrategy {

  private readonly _routeCache = new Map<any, DetachedRouteHandle>();
  private readonly _routeReuseProviders: WbRouteReuseProvider[];

  constructor(@Optional() @Inject(ROUTE_REUSE_PROVIDER) providers: WbRouteReuseProvider[]) {
    this._routeReuseProviders = providers || [];
  }

  /**
   * Invoke to invalidate routes to be reused, e.g. upon logout.
   */
  public invalidate(): void {
    this._routeCache.clear();
  }

  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.computeReuseKey(route) !== null;
  }

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const reuseKey = this.computeReuseKey(route);
    return reuseKey && this._routeCache.has(reuseKey) || false;
  }

  public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const reuseKey = this.computeReuseKey(route);

    if (handle === null) {
      this._routeCache.delete(reuseKey);
    }
    else {
      this._routeCache.set(reuseKey, handle);
    }
  }

  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const reuseKey = this.computeReuseKey(route);
    return this._routeCache.get(reuseKey) || null;
  }

  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig; // same as Angular DefaultRouteReuseStrategy
  }

  /**
   * Computes the reuse key for the given route, or returns 'null' if not to be reused.
   * The first key returned by any provider is used.
   */
  protected computeReuseKey(route: ActivatedRouteSnapshot): string | null {
    for (const provider of this._routeReuseProviders) {
      const reuseKey = provider.computeReuseKey(route);
      if (reuseKey) {
        return reuseKey;
      }
    }

    return null;
  }
}

/**
 * Controls which routes to reuse.
 *
 *
 * Example registration:
 *
 * providers: [
 *   ...
 *   { provide: ROUTE_REUSE_PROVIDER, multi: true, useClass: <your provider class> }
 * ]
 */
export interface WbRouteReuseProvider {

  /**
   * Computes a reuse key if the given route should be reused, or returns 'null' otherwise.
   */
  computeReuseKey(route: ActivatedRouteSnapshot): any;
}
