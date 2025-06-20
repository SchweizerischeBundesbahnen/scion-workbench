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
import {CanMatchFn, GuardResult, PRIMARY_OUTLET, Route, Router, Routes, UrlSegment} from '@angular/router';
import {WorkbenchConfig} from '../workbench-config';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';
import {WorkbenchRouteData} from './workbench-route-data';
import {ɵEmptyOutletComponent} from './empty-outlet/empty-outlet.component';
import {NullContentComponent} from '../null-content/null-content.component';
import {Routing} from './routing.util';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';

/**
 * Facilitates the registration of auxiliary routes of top-level routes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRouteInstaller {

  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _router = inject(Router);

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
          // Provide primary routes only.
          .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
          // Provide outlet if injection context is not available, e.g., in a {@link UrlMatcher}.
          .map(route => ({...route, data: {...route.data, [WorkbenchRouteData.ɵoutlet]: outlet}}))
          // Prevent matching the route if no outlet is present in the URL and the outlet has not been navigated with a hint.
          // Prevents Angular bug that Angular matches canActivate guard regardless of the outlet, and to support for nested routes as Angular does not backtrack empty path routes,
          // prevent page not found and empty content pages to display
          .map(route => ({...route, canMatch: [...route.canMatch ?? [], installCanMatch()]})),
        // Register wildcard route to display "Page Not Found".
        ...config.canMatchNotFoundPage?.length ? [{
          path: '**',
          loadComponent: () => this._workbenchConfig.pageNotFoundComponent ?? PageNotFoundComponent,
          data: {[WorkbenchRouteData.title]: 'Page Not Found', [WorkbenchRouteData.cssClass]: 'e2e-page-not-found'},
          canMatch: config.canMatchNotFoundPage,
        }] : [],
        // Register wildcard route to display blank page.
        {
          path: '**',
          component: NullContentComponent,
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
    console.log('>>> route config', newRoutes);
    this._router.config.splice(0, this._router.config.length, ...newRoutes);
  }
}

/**
 * Configures auxiliary routes.
 */
export interface AuxiliaryRouteConfig {
  /**
   * Specifies `canMatch` guard(s) to activate the wildcard route ("**").
   *
   * If not specified or empty, does not register the wildcard route ("**").
   */
  canMatchNotFoundPage?: Array<CanMatchFn>;
}

function installCanMatch(): CanMatchFn {
  return (route: Route, segments: UrlSegment[]): GuardResult => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET);
    if (route.path !== '') {
      return true;
    }

    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    if (Routing.isViewOutlet(outlet)) {
      const view = layout.view({viewId: outlet}, {orElse: null});
      return !!segments.length || !!view?.navigation?.hint;
    }
    if (Routing.isPartOutlet(outlet)) {
      console.log('>>> outlet', outlet, layout);
      const part = layout.part({partId: outlet}, {orElse: null});
      return !!segments.length || !!part?.navigation?.hint;
    }
    return true;
  }
}

export function canMatchWorkbenchView(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return Routing.isViewOutlet(outlet);
      case false:
        return !Routing.isViewOutlet(outlet);
      default: { // hint
        if (!Routing.isViewOutlet(outlet)) {
          return false;
        }

        const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
        const view = layout.view({viewId: outlet}, {orElse: null});
        return view?.navigation?.hint === condition;
      }
    }
  };
}

/**
 * DI token to inject the outlet name of a workbench auxiliary route.
 *
 * Can be injected in a `CanMatch` guard to obtain a reference to the workbench element.
 */
export const WORKBENCH_AUXILIARY_ROUTE_OUTLET = new InjectionToken<string>('ɵWORKBENCH_AUXILIARY_ROUTE_OUTLET');
