import { Injectable, Type } from '@angular/core';
import { CanActivate, CanDeactivate, Data, PRIMARY_OUTLET, ResolveData, Router, Routes } from '@angular/router';
import { EmptyOutletComponent } from './empty-outlet.component';
import { Arrays } from '@scion/toolkit/util';

/**
 * Registers auxiliary routes for views and activities.
 */
@Injectable()
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
      .filter(primaryRoute => primaryRoute.path !== '') // skip empty path routes because not supported in named outlets
      .forEach(primaryRoute => outletNames.forEach(outlet => {
        outletAuxRoutes.push({
          ...primaryRoute,
          outlet: outlet,
          component: primaryRoute.component || EmptyOutletComponent, // EmptyOutletComponent is used for lazy loading of aux routes; see 'router/src/utils/config.ts#standardizeConfig' and Angular PR #23459.
          canActivate: [...(config.canActivate || []), ...(primaryRoute.canActivate || [])],
          canDeactivate: [...(config.canDeactivate || []), ...(primaryRoute.canDeactivate || [])],
          data: {...primaryRoute.data, ...config.data},
          resolve: {...primaryRoute.resolve, ...config.resolve},
        });
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
