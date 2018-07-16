/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, PRIMARY_OUTLET, Router, Routes, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { WB_ROUTE_REUSE_IDENTITY_PARAM } from '../routing/routing-params.constants';
import { ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { WbActivityDirective } from './wb-activity.directive';
import { WorkbenchRouter } from '../routing/workbench-router.service';

@Injectable()
export class WorkbenchActivityPartService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _activeActivity: WbActivityDirective;
  public activities: WbActivityDirective[] = [];

  constructor(private _router: Router,
              private _wbRouter: WorkbenchRouter,
              route: ActivatedRoute) {
    // Register all primary routes as activity auxiliary routes
    const routes = this.createAuxiliaryRoutes();
    this.installRoutes([...this._router.config, ...routes]);

    // Subscribe for routing events to open/close activity panel
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        const activeActivityRoute = route.snapshot.root.children.find(it => it.outlet === ACTIVITY_OUTLET_NAME);
        this._activeActivity = activeActivityRoute && this.resolveElseThrow(activeActivityRoute) || null;
      });
  }

  public get activeActivity(): WbActivityDirective {
    return this._activeActivity;
  }

  public isActive(activity: WbActivityDirective): boolean {
    return this._activeActivity === activity;
  }

  /**
   * Activates the given activity.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateActivity(activity: WbActivityDirective): Promise<boolean> {
    if (activity.target === 'activity-panel') {
      const commands = (this._activeActivity === activity ? null : activity.commands); // toogle activity
      return this._router.navigate([{outlets: {[ACTIVITY_OUTLET_NAME]: commands}}], {
        queryParamsHandling: 'preserve'
      });
    }
    else if (activity.target === 'view') {
      return this._wbRouter.navigate(activity.commands);
    }
    throw Error('Illegal activity target; must be \'activity-panel\' or \'view\'');
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private createAuxiliaryRoutes(): Routes {
    const primaryRoutes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);
    return primaryRoutes.map(it => {
      return {
        ...it,
        outlet: ACTIVITY_OUTLET_NAME,
        data: {
          ...it.data,
          [WB_ROUTE_REUSE_IDENTITY_PARAM]: {}, // do not destroy component when switching between activities
        }
      };
    });
  }

  private installRoutes(routes: Routes): void {
    // Note: Do not use Router.resetConfig(...) which would destroy any currently routed component.
    this._router.config = routes;
  }

  /**
   * Resolves the activity which matches the given URL path, or throws an error if not found.
   */
  public resolveElseThrow(route: ActivatedRouteSnapshot): WbActivityDirective {
    if (route.outlet !== ACTIVITY_OUTLET_NAME) {
      throw Error('Illegal state: Not in the context of an activity');
    }

    const path = route.url.map((segment: UrlSegment) => segment.path).join();
    const activity = this.activities.find(it => it.path === path);
    if (!activity) {
      throw Error('Illegal state: unknown activity');
    }
    return activity;
  }
}
