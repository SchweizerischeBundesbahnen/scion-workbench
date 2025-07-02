/*
* Copyright (c) 2018-2024 Swiss Federal Railways
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*/

import {inject, Injectable, InjectionToken} from '@angular/core';
import {CanMatchFn, PRIMARY_OUTLET, Route, Router, Routes} from '@angular/router';
import {WorkbenchConfig} from '../workbench-config';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';
import {WorkbenchRouteData} from './workbench-route-data';
import {ɵEmptyOutletComponent} from './empty-outlet/empty-outlet.component';
import {NullContentComponent} from '../null-content/null-content.component';
import {WORKBENCH_ROUTE, WorkbenchOutlet} from '../workbench.constants';
import {matchesIfNavigated} from './workbench-route-guards';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Enables the registration of auxiliary routes of top-level primary routes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRouteInstaller {

  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _router = inject(Router);
  private readonly _workbenchRoutes = inject(WORKBENCH_ROUTE, {optional: true}) as Route[] | null ?? [];

  /**
   * Creates an empty-path auxiliary route for each passed outlet and adds the primary routes defined in the router config as child routes,
   * enabling navigation in specified router outlets.
   *
   * @param outlets - Specifies outlets for which to create auxiliary routes.
   * @param config - Specifies the config of the auxiliary routes.
   */
  public registerAuxiliaryRoutes(outlets: WorkbenchOutlet[], config: AuxiliaryRouteConfig = {}): Routes {
    if (!outlets.length) {
      return [];
    }

    const registeredRoutes = outlets
      .map((outlet: WorkbenchOutlet): Route => ({
        path: '',
        outlet,
        providers: [{provide: WORKBENCH_OUTLET, useValue: outlet}],
        component: ɵEmptyOutletComponent,
        children: [
          // Add workbench-specific routes.
          ...this._workbenchRoutes
            // Provide outlet for {@link UrlMatcher} as not called inside a route's injection context.
            .map(route => ({...route, data: {...route.data, [WorkbenchRouteData.ɵoutlet]: outlet}})),
          // Add application-specific routes.
          ...this._router.config
            // Filter primary routes.
            .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
            // Filter wildcard route as most likely not indended for workbench outlets. Otherwise, the "Not Found" and "Nothing to Show" pages would never be matched.
            .filter(route => route.path !== '**')
            // Only match the route if the outlet has been navigated, preventing the following issues for application having an empty-path parent route (tested in `app-with-guard.e2e-spec.ts`, `app-with-redirect.e2e-spec.ts`):
            // - Redirecting in a `CanActivate` guard on an empty-path parent route would lead to an infinite loop.
            // - The "Not Found" page would not be displayed for an empty-path navigation.
            // - The "Not Found" page would not be displayed when clearing the outlets from the URL.
            // - The "Nothing to Show" page would not be displayed at all.
            //
            // The issues are caused because Angular always attempts to match empty-path auxiliary routes if the outlet is not included in the URL, regardless
            // of whether the outlet has been navigated to the empty-path route or not. Additionally, Angular's route matcher does not backtrack if it cannot
            // find a route for an empty-path outlet in an empty-path subtree. This prevents fallback to a top-level wildcard route, such as a "Not Found" or
            // "Nothing to Show" route.
            .map(route => ({...route, canMatch: [...route.canMatch ?? [], matchesIfNavigated]})),
        ],
      }))
      // Add "Page Not Found" wildcard route.
      .map(route => addNotFoundWildcardRoute(route, {component: this._workbenchConfig.pageNotFoundComponent, canMatch: config.notFoundRoute}))
      // Add "Nothing to Show" wildcard route.
      .map(route => addNullContentWildcardRoute(route));

    this.replaceRouterConfig([
      ...this._router.config,
      ...registeredRoutes,
    ]);

    return registeredRoutes;
  }

  /**
   * Unregisters auxiliary routes for the given outlet.
   */
  public unregisterAuxiliaryRoutes(outlets: string[]): void {
    const outletsToRemove = new Set<string>(outlets);

    function shouldRemoveRoute(route: Route): boolean {
      return !!route.outlet && outletsToRemove.has(route.outlet);
    }

    this.replaceRouterConfig(this._router.config.filter(route => !shouldRemoveRoute(route)));
  }

  /**
   * Replaces the router configuration to install or uninstall auxiliary routes.
   */
  private replaceRouterConfig(config: Routes): void {
    // Note:
    //   - Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes
    //   - Do not assign the router a new Routes object (Router.config = ...) to allow resolution of routes added during `NavigationStart` (since Angular 7.x)
    //     (because Angular uses a reference to the Routes object during route navigation)
    const newRoutes: Routes = [...config];
    this._router.config.splice(0, this._router.config.length, ...newRoutes);
  }
}

/**
 * Recursively adds a "Not Found" wildcard route to the specified route and its child routes.
 *
 * Has no effect if the route has no child routes or if no `CanMatch` guard is provided.
 *
 * @see PageNotFoundComponent
 */
function addNotFoundWildcardRoute(route: Route, options: {component?: ComponentType<unknown>; canMatch?: true | CanMatchFn}): Route {
  if (!options.canMatch) {
    return route;
  }
  if (!route.children) {
    return route;
  }

  return {
    ...route,
    children: [
      ...route.children.map(child => addNotFoundWildcardRoute(child, options)),
      {
        path: '**',
        component: options.component ?? PageNotFoundComponent,
        data: {[WorkbenchRouteData.title]: '%workbench.page_not_found.title', [WorkbenchRouteData.cssClass]: 'e2e-page-not-found'},
        canMatch: options.canMatch === true ? undefined : [options.canMatch],
      },
    ],
  };
}

/**
 * Adds the "Nothing to Show" wildcard route as child route.
 *
 * @see NullContentComponent
 */
function addNullContentWildcardRoute(route: Route): Route {
  return {
    ...route,
    children: [
      ...route.children ?? [],
      {
        path: '**',
        component: NullContentComponent,
      },
    ],
  };
}

/**
 * Configures auxiliary routes.
 */
export interface AuxiliaryRouteConfig {
  /**
   * Controls whether to install the wildcard route ("**") if no route matches.
   *
   * A `CanMatch` guard can be provided for conditional installation.
   *
   * Defaults to not adding the wildcard route.
   */
  notFoundRoute?: true | CanMatchFn;
}

/**
 * DI token to inject the outlet name of a workbench auxiliary route.
 *
 * Can be injected in a `CanMatch` guard to obtain a reference to the workbench element.
 */
export const WORKBENCH_OUTLET = new InjectionToken<WorkbenchOutlet>('ɵWORKBENCH_OUTLET');
