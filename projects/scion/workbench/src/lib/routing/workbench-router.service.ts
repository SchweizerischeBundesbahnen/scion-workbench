/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { VIEW_GRID_QUERY_PARAM, VIEW_REF_PREFIX } from '../workbench.constants';
import { DefaultUrlSerializer, NavigationExtras, PRIMARY_OUTLET, Router, Routes, UrlSegment } from '@angular/router';
import { WorkbenchService } from '../workbench.service';
import { ViewPartGridUrlObserver } from '../view-part-grid/view-part-grid-url-observer.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { WorkbenchView } from '../workbench.model';
import { EmptyOutletComponent } from './empty-outlet.component';

/**
 * Provides the workbench view navigation capabilities bases on Angular Router.
 */
export abstract class WorkbenchRouter {

  /**
   * Navigate based on the provided array of commands, and is like 'Router.navigate(...)' but with a workbench view as the routing target.
   *
   * Use matrix parameters to associate optional data with the view outlet URL.
   * Matrix parameters are like regular URL parameters, but do not affect route resolution.
   * Unlike query parameters, matrix parameters are part of the routing path, which makes them suitable for auxiliary routes.
   * Also, matrix parameters are removed upon destruction of the view outlet, and parameter names must not be qualified with the view identity.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'user', 11]);
   * router.navigate(['teams', {selection: 33'}]); // matrix parameter 'selection' with the value '33'.
   * ```
   *
   * @see WbRouterLinkDirective
   */
  public abstract navigate(commands: any[], extras?: WbNavigationExtras): Promise<boolean>;

  /**
   * Resolves open views which match the given URL path.
   */
  public abstract resolve(commands: any[]): WorkbenchView[];
}

@Injectable()
export class InternalWorkbenchRouter implements WorkbenchRouter {


  constructor(private _router: Router,
              private _workbench: WorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartGridUrlObserver: ViewPartGridUrlObserver) {
  }

  /**
   * Navigate based on the provided array of commands, and is like 'Router.navigate(...)' but with a workbench view as the routing target.
   *
   * Use matrix parameters to associate optional data with the view outlet URL.
   * Matrix parameters are like regular URL parameters, but do not affect route resolution.
   * Unlike query parameters, matrix parameters are part of the routing path, which makes them suitable for auxiliary routes.
   * Also, matrix parameters are removed upon destruction of the view outlet, and parameter names must not be qualified with the view identity.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'user', 11]);
   * router.navigate(['teams', {selection: 33'}]); // matrix parameter 'selection' with the value '33'.
   * ```
   *
   * @see WbRouterLinkDirective
   */
  public navigate(commands: any[], extras: WbNavigationExtras = {}): Promise<boolean> {
    const coerceActivate = extras.tryActivateView === undefined && !commands.includes('new') && !commands.includes('create');

    // If view is already opened, activate it.
    if (extras.tryActivateView || coerceActivate) {
      const views = this.resolve(commands);
      const viewRef = views.length && views[0].viewRef || null;
      const viewPartService = viewRef && this._workbench.resolveContainingViewPartServiceElseThrow(viewRef);
      if (viewPartService) {
        return viewPartService.activateView(viewRef);
      }
    }

    const routeFn = (outlet: string, serializedGrid: string): Promise<boolean> => {
      return this._router.navigate([{outlets: {[outlet]: commands}}], {
        ...extras as NavigationExtras,
        queryParams: {...extras.queryParams, [VIEW_GRID_QUERY_PARAM]: serializedGrid},
        queryParamsHandling: 'merge'
      });
    };

    switch (extras.target || 'blank') {
      case 'blank': {
        const newViewRef = this._viewRegistry.computeNextViewOutletIdentity();
        const viewPartRef = extras.blankViewPartRef || this._workbench.activeViewPartService.viewPartRef;
        const grid = this._viewPartGridUrlObserver.snapshot.addView(viewPartRef, newViewRef).serialize();
        return routeFn(newViewRef, grid);
      }
      case 'self': {
        if (!extras.selfViewRef) {
          throw Error('Invalid argument: navigation property \'selfViewRef\' required for routing view target \'self\'.');
        }

        const urlTree = new DefaultUrlSerializer().parse(this._router.url);
        const urlSegmentGroups = urlTree.root.children;
        if (!Object.keys(urlSegmentGroups).includes(extras.selfViewRef)) {
          throw Error(`Invalid argument: '${extras.selfViewRef}' is not a valid view outlet.`);
        }

        return routeFn(extras.selfViewRef, this._viewPartGridUrlObserver.snapshot.serialize());
      }
      default: {
        throw Error('Not supported routing view target.');
      }
    }
  }

  /**
   * Resolves open views which match the given URL path.
   */
  public resolve(commands: any[]): WorkbenchView[] {
    const commandsJoined = commands.filter(it => typeof it !== 'object').map(it => encodeURI(it)).join(); // do not match URL matrix parameters
    const urlTree = new DefaultUrlSerializer().parse(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    return Object.keys(urlSegmentGroups)
      .filter(it => {
        return it.startsWith(VIEW_REF_PREFIX) && (urlSegmentGroups[it].segments.map((segment: UrlSegment) => segment.path).join() === commandsJoined);
      })
      .map((viewRef: string) => {
        return this._viewRegistry.getElseThrow(viewRef);
      });
  }


  /**
   * Replaces the router configuration to install or uninstall auxiliary routes.
   */
  public replaceRouterConfig(config: Routes): void {
    // Note: Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes.
    this._router.config = config;
  }

  /**
   * Creates a named auxiliary route for every primary route found in the router config.
   * This allows all primary routes to be used in a named router outlet of the given outlet name.
   *
   * @param outlet for which to create named auxiliary routes
   * @param params optional parametrization of the auxilary route
   */
  public createAuxiliaryRoutesFor(outlet: string, params: AuxiliaryRouteParams = {}): Routes {
    const primaryRoutes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);

    return primaryRoutes.map(it => {
      return {
        ...it,
        outlet: outlet,
        component: it.component || EmptyOutletComponent, // used for lazy loading of aux routes; see Angular PR #23459
        canDeactivate: [...(it.canDeactivate || []), ...(params.canDeactivate || [])],
      };
    });
  }
}

/**
 * Controls creation of auxiliary routes for named router outlets.
 *
 * @internal
 */
export interface AuxiliaryRouteParams {
  canDeactivate?: any[];
}

/**
 * Represents the extra options used during navigation.
 */
export interface WbNavigationExtras extends NavigationExtras {

  /**
   * If there exists a view with the specified URL in the workbench, that view is activated.
   * Otherwise, depending on the view target strategy, a new workbench view is created, which is by default,
   * or the URL is loaded into the current view.
   */
  tryActivateView?: boolean;

  /**
   * Controls how to open the view.
   *
   * 'blank':    The URL is loaded into a new workbench view. This is default.
   *             By default, the workbench view is added to the active view part, which, however, can be controlled with 'blankViewPartRef' navigation property.
   * 'self':     The URL replaces the content of the workbench view as specified in 'selfViewRef' navigation property, which, by default, is set to the current view context.
   *             This method throws an error if no workbench view outlet exists with the specified name.
   */
  target?: 'blank' | 'self';
  /**
   * Specifies the self target for which to apply the URL.
   * If not specified and in the context of a workbench view, that workbench view is used as the self target.
   */
  selfViewRef?: string;

  /**
   * Specifies the 'blankViewPartRef' where to attach the new view when using 'blank' view target strategy.
   * If not specified, the active workbench viewpart is used as the 'blank' target.
   */
  blankViewPartRef?: string;
}
