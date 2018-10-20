import { Injectable } from '@angular/core';
import { Data, PRIMARY_OUTLET, Router, Routes } from '@angular/router';
import { ActivityResolver } from './activity.resolver';
import { ACTIVITY_DATA_KEY, ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { EmptyOutletComponent } from './empty-outlet.component';
import { ResolveData } from '@angular/router/src/config';

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
   * Registers a named auxiliary route for every primary route found in the router config.
   * This allows all primary routes to be used in a named router outlet of the given outlet name.
   *
   * @param outlet for which to create named auxiliary routes
   * @param params optional parametrization of the auxilary route
   */
  private registerAuxiliaryRoutesFor(outlet: string, params: AuxiliaryRouteParams = {}): Routes {
    const primaryRoutes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);

    const auxRoutes: Routes = primaryRoutes.map(it => {
      return {
        ...it,
        outlet: outlet,
        component: it.component || EmptyOutletComponent, // used for lazy loading of aux routes; see Angular PR #23459
        canDeactivate: [...(it.canDeactivate || []), ...(params.canDeactivate || [])],
        data: {...it.data, ...params.data},
        resolve: {...it.resolve, ...params.resolve},
      };
    });

    this.replaceRouterConfig([
      ...this._router.config.filter(route => route.outlet !== outlet), // all registered routes, except auxiliary routes of the outlet
      ...auxRoutes
    ]);

    return auxRoutes;
  }

  /**
   * Replaces the router configuration to install or uninstall auxiliary routes.
   */
  public replaceRouterConfig(config: Routes): void {
    // Note: Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes.
    this._router.config = config;
  }
}

/**
 * Controls creation of auxiliary routes for named router outlets.
 */
interface AuxiliaryRouteParams {
  canDeactivate?: any[];
  data?: Data;
  resolve?: ResolveData;
}
