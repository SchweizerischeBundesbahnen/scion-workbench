import {Injectable, Type} from '@angular/core';
import {CanActivate, CanDeactivate, Data, PRIMARY_OUTLET, ResolveData, Route, Router, Routes, ɵEmptyOutletComponent} from '@angular/router';
import {Arrays} from '@scion/toolkit/util';

/**
 * Registers auxiliary routes for views.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRoutesRegistrator {

  constructor(private _router: Router) {
  }

  /**
   * Registers an auxiliary route for every primary route found in the router config, allowing
   * primary routes to be used in named router outlets.
   *
   * @param outletName(s) for which to create named auxiliary routes
   * @param config of the auxiliary route
   */
  public registerOutletAuxiliaryRoutes(outletName: string | string[], config: OutletAuxiliaryRouteConfig = {}): Routes {
    const outletNames = new Set<string>(Arrays.coerce(outletName));
    if (!outletNames.size) {
      return [];
    }

    const primaryRoutes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);
    const outletAuxRoutes: Routes = [];
    primaryRoutes
      .filter(primaryRoute => primaryRoute.path !== '') // skip root route(s)
      .forEach(primaryRoute => outletNames.forEach(outlet => {
        outletAuxRoutes.push(standardizeConfig({
          ...primaryRoute,
          outlet: outlet,
          canActivate: [...(config.canActivate || []), ...(primaryRoute.canActivate || [])],
          canDeactivate: [...(config.canDeactivate || []), ...(primaryRoute.canDeactivate || [])],
          data: {...primaryRoute.data, ...config.data},
          resolve: {...primaryRoute.resolve, ...config.resolve},
        }));
      }));

    this.replaceRouterConfig([
      ...this._router.config.filter(route => !route.outlet || !outletNames.has(route.outlet)), // all registered routes, except auxiliary routes for any of the given outlets
      ...outletAuxRoutes,
    ]);

    return outletAuxRoutes;
  }

  /**
   * Unregisters all auxiliary routes for the given outlet.
   */
  public unregisterOutletAuxiliaryRoutes(outletName: string | string[]): void {
    const outletNames = new Set<string>(Arrays.coerce(outletName));
    if (!outletNames.size) {
      return;
    }

    this.replaceRouterConfig(this._router.config.filter(route => !route.outlet || !outletNames.has(route.outlet)));
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
 * Controls the creation of auxiliary routes for a named router outlet.
 */
export interface OutletAuxiliaryRouteConfig {
  canDeactivate?: Type<CanDeactivate<any>>[];
  canActivate?: Type<CanActivate>[];
  data?: Data;
  resolve?: ResolveData;
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
