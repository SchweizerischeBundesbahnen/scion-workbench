/*
* Copyright (c) 2018-2024 Swiss Federal Railways
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*/

import {Component, Injectable, InjectionToken} from '@angular/core';
import {CanMatchFn, PRIMARY_OUTLET, Route, Router, Routes} from '@angular/router';
import {WorkbenchConfig} from '../workbench-config';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';
import {WorkbenchRouteData} from './workbench-route-data';
import {ɵEmptyOutletComponent} from './empty-outlet/empty-outlet.component';

/**
 * Facilitates the registration of auxiliary routes of top-level routes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRouteInstaller {

  constructor(private _workbenchConfig: WorkbenchConfig, private _router: Router) {
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

    const registeredRoutes = outlets.map(outlet => ({
      path: '',
      outlet,
      providers: [{provide: WORKBENCH_AUXILIARY_ROUTE_OUTLET, useValue: outlet}],
      component: ɵEmptyOutletComponent,
      children: [
        ...this._router.config
          .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
          .map(route => ({...route, data: {...route.data, [WorkbenchRouteData.ɵoutlet]: outlet}})),
        // Register wildcard route to display "Page Not Found".
        {
          path: '**',
          loadComponent: () => this._workbenchConfig.pageNotFoundComponent ?? PageNotFoundComponent,
          data: {[WorkbenchRouteData.title]: 'Page Not Found', [WorkbenchRouteData.cssClass]: 'e2e-page-not-found'},
          canMatch: config.canMatchNotFoundPage,
        },
        // Register wildcard route to display blank page.
        {
          path: '**',
          component: BlankComponent,
        },
      ],
    } satisfies Route));

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
   * Specifies "CanMatch" guard(s) to install on the wildcard route (`**`),
   * selected by the router if no route matches the requested URL.
   */
  canMatchNotFoundPage?: Array<CanMatchFn>;
}

/**
 * DI token to inject the outlet name of a workbench auxiliary route.
 *
 * Can be injected in a `CanMatch` guard to obtain a reference to the workbench element.
 */
export const WORKBENCH_AUXILIARY_ROUTE_OUTLET = new InjectionToken<string>('ɵWORKBENCH_AUXILIARY_ROUTE_OUTLET');

/**
 * Component to display if the outlet has not yet been navigated or no navigation information is available.
 */
@Component({selector: 'wb-blank', template: '', standalone: true})
export class BlankComponent {
}
