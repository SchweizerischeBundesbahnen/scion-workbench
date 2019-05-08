import { Injectable } from '@angular/core';
import { Data, PRIMARY_OUTLET, Router, Routes } from '@angular/router';
import { ActivityResolver } from './activity.resolver';
import { ACTIVITY_DATA_KEY, ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { EmptyOutletComponent } from './empty-outlet.component';
import { WbBeforeDestroyGuard } from '../view/wb-before-destroy.guard';
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
   * Registers a named view auxiliary route for every primary route found in the router config.
   */
  public registerViewAuxiliaryRoutes(...viewRefs: string[]): Routes {
    const auxRoutes: Routes = [];
    viewRefs.forEach(viewRef => {
      auxRoutes.push(...this.registerAuxiliaryRoutesFor(viewRef, {canDeactivate: [WbBeforeDestroyGuard]}));
    });
    return auxRoutes;
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

    const auxRoutes: Routes = primaryRoutes
      .filter(primaryRoute => primaryRoute.path !== '') // skip empty path routes because not supported in named outlets
      .map(it => {
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
      ...auxRoutes,
    ]);

    return auxRoutes;
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
  canDeactivate?: any[];
  data?: Data;
  resolve?: ResolveData;
}
