import { Injectable, Type } from '@angular/core';
import { CanActivate, CanDeactivate, Data, PRIMARY_OUTLET, ResolveData, Router, Routes } from '@angular/router';
import { ActivityResolver } from './activity.resolver';
import { ACTIVITY_DATA_KEY, ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { EmptyOutletComponent } from './empty-outlet.component';
import { WbBeforeDestroyGuard } from '../view/wb-before-destroy.guard';
import { WbAddViewToPartGuard } from './add-view-to-part.guard';
import { Arrays } from '@scion/toolkit/util';

/**
 * Registers auxiliary routes for views and activities.
 */
@Injectable()
export class WorkbenchAuxiliaryRoutesRegistrator {

  constructor(private _router: Router) {
  }

  /**
   * Registers a named activity auxiliary route for every primary route found in the router config.
   */
  public registerActivityAuxiliaryRoutes(): Routes {
    return this.registerAuxiliaryRoutesFor(ACTIVITY_OUTLET_NAME, {resolve: {[ACTIVITY_DATA_KEY]: ActivityResolver}});
  }

  /**
   * Registers a named view auxiliary route for every primary route found in the router config.
   */
  public registerViewAuxiliaryRoutes(...viewIds: string[]): Routes {
    return this.registerAuxiliaryRoutesFor(viewIds, {
      canActivate: [WbAddViewToPartGuard],
      canDeactivate: [WbBeforeDestroyGuard],
    });
  }

  /**
   * Registers a named auxiliary route for every primary route found in the router config.
   * This allows all primary routes to be used in a named router outlet of the given outlet name(s).
   *
   * @param outletName(s) for which to create named auxiliary routes
   * @param params optional parametrization of the auxilary route
   */
  private registerAuxiliaryRoutesFor(outletName: string | string[], params: AuxiliaryRouteParams = {}): Routes {
    const primaryRoutes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);

    const outletAuxRoutes: Routes = [];
    const outletNames = new Set<string>(Arrays.coerce(outletName));
    primaryRoutes
      .filter(primaryRoute => primaryRoute.path !== '') // skip empty path routes because not supported in named outlets
      .forEach(primaryRoute => outletNames.forEach(outlet => {
        outletAuxRoutes.push({
          ...primaryRoute,
          outlet: outlet,
          component: primaryRoute.component || EmptyOutletComponent, // EmptyOutletComponent is used for lazy loading of aux routes; see 'router/src/utils/config.ts#standardizeConfig' and Angular PR #23459.
          canActivate: [...(params.canActivate || []), ...(primaryRoute.canActivate || [])],
          canDeactivate: [...(params.canDeactivate || []), ...(primaryRoute.canDeactivate || [])],
          data: {...primaryRoute.data, ...params.data},
          resolve: {...primaryRoute.resolve, ...params.resolve},
        });
      }));

    this.replaceRouterConfig([
      ...this._router.config.filter(route => !outletNames.has(route.outlet)), // all registered routes, except auxiliary routes for any of the given outlets
      ...outletAuxRoutes,
    ]);

    return outletAuxRoutes;
  }

  /**
   * Replaces the router configuration to install or uninstall auxiliary routes.
   */
  public replaceRouterConfig(config: Routes): void {
    // Note:
    //   - Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes
    //   - Do not assign the router a new Routes object (Router.config = ...) to allow resolution of routes added during `NavigationStart` (since Angular 7.x)
    //     (because Angular uses a reference to the Routes object during route navigation)
    const newRoutes: Routes = [...config];
    this._router.config.splice(0, this._router.config.length, ...newRoutes);
  }
}

/**
 * Controls creation of auxiliary routes for named router outlets.
 */
interface AuxiliaryRouteParams {
  canDeactivate?: Type<CanDeactivate<any>>[];
  canActivate?: Type<CanActivate>[];
  data?: Data;
  resolve?: ResolveData;
}
