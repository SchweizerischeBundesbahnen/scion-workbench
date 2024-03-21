import {inject, Injectable} from '@angular/core';
import {CanActivateFn, CanDeactivateFn, CanMatchFn, Data, Route, Router, Routes, ɵEmptyOutletComponent} from '@angular/router';
import {RouterUtils} from './router.util';
import {WorkbenchRouter} from './workbench-router.service';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import ViewNotFoundComponent from './view-not-found/view-not-found.component';

/**
 * Registers auxiliary routes for views.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchAuxiliaryRoutesRegistrator {

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig, private _router: Router) {
  }

  /**
   * Registers an auxiliary route for every primary route found in the router config, allowing
   * primary routes to be used in named router outlets.
   *
   * @param outlets - outlet names for which to create named auxiliary routes
   * @param config of the auxiliary route
   */
  public registerOutletAuxiliaryRoutes(outlets: string[], config: OutletAuxiliaryRouteConfig = {}): Routes {
    if (!outlets.length) {
      return [];
    }

    const registeredRoutes: Routes = [];
    outlets.forEach(outlet => {
      this._router.config
        .filter(route => !RouterUtils.isRootRoute(route) && !RouterUtils.isViewOutlet(route.outlet) && !RouterUtils.isPopupOutlet(route.outlet))
        .forEach(route => {
          registeredRoutes.push(standardizeConfig({
            ...route,
            outlet: outlet,
            canActivate: [...(config.canActivate || []), ...(route.canActivate || [])],
            canDeactivate: [...(config.canDeactivate || []), ...(route.canDeactivate || [])],
            canMatch: [...(config.canMatch?.(route) ?? []), ...(route.canMatch ?? [])],
            data: {...route.data, ...config.data},
          }));
        });

      // register not found route (must be at the end)
      registeredRoutes.push(standardizeConfig({
        path: '**',
        outlet: outlet,
        component: this._workbenchModuleConfig.viewNotFoundComponent ?? ViewNotFoundComponent, // TODO [WB-LAYOUT] Consider passing as argument to have no view-specifics in this class
        canMatch: [(): boolean => {
          // TODO [WB-LAYOUT] describe why
          const layout = inject(WorkbenchRouter).getCurrentNavigationContext().layout;
          const view = layout.view({by: {viewId: outlet as ViewId}}, {orElse: null});
          return !view || !!view.navigation;
        }],
      }));
    });

    this.replaceRouterConfig([
      ...this._router.config,
      ...registeredRoutes,
    ]);

    return registeredRoutes;
  }

  /**
   * Unregisters all auxiliary routes for the given outlet.
   */
  public unregisterOutletAuxiliaryRoutes(outlets: string[]): void {
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
 * Controls the creation of auxiliary routes for a named router outlet.
 */
export interface OutletAuxiliaryRouteConfig {
  canActivate?: CanActivateFn[];
  canDeactivate?: CanDeactivateFn<any>[];
  canMatch?: (relatedRoute: Route) => CanMatchFn[];
  data?: Data;
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
