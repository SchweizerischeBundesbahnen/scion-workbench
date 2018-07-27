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
import { NavigationEnd, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { WbActivityDirective } from './wb-activity.directive';
import { InternalWorkbenchRouter } from '../routing/workbench-router.service';
import { UrlSegmentGroup } from '@angular/router/src/url_tree';

@Injectable()
export class WorkbenchActivityPartService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _activeActivity: WbActivityDirective;
  public activities: WbActivityDirective[] = [];

  constructor(private _router: Router, private _wbRouter: InternalWorkbenchRouter) {
    // Register all primary routes as activity auxiliary routes
    const routes = this._wbRouter.createAuxiliaryRoutesFor(ACTIVITY_OUTLET_NAME);
    this._wbRouter.replaceRouterConfig([...this._router.config, ...routes]);

    // Subscribe for routing events to open/close activity panel
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this._activeActivity = this.parseActivityFromUrl(this._router.url);
      });
  }

  /**
   * Returns the activity which is currently toggled.
   */
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

  private parseActivityFromUrl(url: string): WbActivityDirective {
    const activitySegmentGroup: UrlSegmentGroup = this._router
      .parseUrl(url)
      .root.children[ACTIVITY_OUTLET_NAME];

    if (!activitySegmentGroup) {
      return null; // no activity selected
    }

    // Resolve the activity
    const activityPath = activitySegmentGroup.segments.map((it: UrlSegment) => it.path).join('/');
    const activity = this.activities
      .filter(it => it.target === 'activity-panel')
      .find(it => it.path === activityPath);

    if (!activity) {
      throw Error(`Illegal state: unknown activity in URL [${activityPath}]`);
    }

    return activity;
  }
}
