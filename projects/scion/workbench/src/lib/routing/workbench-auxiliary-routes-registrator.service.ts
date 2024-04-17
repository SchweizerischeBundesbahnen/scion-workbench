/*
* Copyright (c) 2018-2024 Swiss Federal Railways
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*/

import {Injectable, InjectionToken} from '@angular/core';
import {CanDeactivateFn, CanMatchFn, PRIMARY_OUTLET, Route, Router, Routes, ɵEmptyOutletComponent} from '@angular/router';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';
import {WorkbenchRouteData} from './workbench-route-data';

/**
 * Facilitates the registration of auxiliary routes of top-level routes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRoutesRegistrator {

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig, private _router: Router) {
  }

  /**
   * Registers an auxiliary route for each top-level route, enabling navigation in the specified router outlet(s).
   *
   * @param outlets - Specifies outlets for which to create auxiliary routes.
   * @param config - Specifies the config of the auxiliary routes.
   */
  public registerAuxiliaryRoutes(outlets: string[], config: AuxiliaryRouteConfig = {}): Routes {
    if (!outlets.length) {
      return [];
    }

    const registeredRoutes: Routes = [];
    outlets.forEach(outlet => {
      this._router.config
        .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
        .forEach(route => {
          registeredRoutes.push(standardizeConfig({
            ...route,
            outlet,
            providers: [{provide: WORKBENCH_AUXILIARY_ROUTE_OUTLET, useValue: outlet}, ...(route.providers ?? [])],
            canDeactivate: [...(config.canDeactivate || []), ...(route.canDeactivate || [])],
          }));
        });

      // Register "Page Not Found" route; must be registered as the last auxiliary route for the outlet.
      registeredRoutes.push(standardizeConfig({
        path: '**',
        outlet,
        providers: [{provide: WORKBENCH_AUXILIARY_ROUTE_OUTLET, useValue: outlet}],
        loadComponent: () => this._workbenchModuleConfig.pageNotFoundComponent ?? PageNotFoundComponent,
        data: {[WorkbenchRouteData.title]: 'Page Not Found', [WorkbenchRouteData.cssClass]: 'e2e-page-not-found'},
        canMatch: config.canMatchNotFoundPage || [],
      }));
    });

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
 * Configures auxiliary routes.
 */
export interface AuxiliaryRouteConfig {
  /**
   * Specifies "CanDeactivate" guard(s) to install on the auxiliary routes.
   */
  canDeactivate?: Array<CanDeactivateFn<unknown>>;
  /**
   * Specifies "CanMatch" guard(s) to install on the wildcard route (`**`),
   * selected by the router if no route matches the requested URL.
   */
  canMatchNotFoundPage?: Array<CanMatchFn>;
}

/**
 * Standardizes given route for registration. Copied from Angular 'router/src/utils/config.ts#standardizeConfig'.
 *
 * Performs the following steps:
 * - Sets the `component` property to {@link ɵEmptyOutletComponent} if given route is a component-less parent route; see Angular PR #23459.
 */
function standardizeConfig(route: Route): Route {
  if (!route.component && !route.loadComponent && (route.children || route.loadChildren)) {
    route.component = ɵEmptyOutletComponent;
  }
  route.children?.forEach(standardizeConfig);
  return route;
}

/**
 * DI token to inject the outlet of a workbench auxiliary route.
 *
 * Can be injected in a `CanMatch` guard to obtain a reference to the workbench element.
 */
export const WORKBENCH_AUXILIARY_ROUTE_OUTLET = new InjectionToken<string>('WORKBENCH_AUXILIARY_ROUTE_OUTLET');
