/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Resolve, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Activity, InternalActivity } from '../activity-part/activity';
import { Subject } from 'rxjs';
import { WorkbenchActivityPartService } from '../activity-part/workbench-activity-part.service';
import { ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * Resolves the {Activity} of an activity route and makes it available to the routing context.
 */
@Injectable()
export class ActivityResolver implements Resolve<Activity>, OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _activityPartService: WorkbenchActivityPartService, private _router: Router) {
    this.listenForActivityDeactivation();
  }

  public resolve(activityRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Activity {
    // Read activity auxiliary route
    const activitySegmentGroup = this._router.parseUrl(state.url).root.children[ACTIVITY_OUTLET_NAME];
    if (!activitySegmentGroup) {
      throw Error('[ActivityContextError] Route not in the context of an activity');
    }

    // Resolve the activity
    const activityPath = activitySegmentGroup.segments.map((it: UrlSegment) => it.path).join('/');
    const activity = this._activityPartService.activities.find(it => it.path === activityPath);
    if (!activity) {
      throw Error(`[NullActivityError] Cannot find activity that matches the path '${activityPath}'. Did you provide it as '<wb-activity>' or register it in 'WorkbenchActivityPartService'?`);
    }

    this.activateActivity(activity);
    return activity;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private activateActivity(activity: Activity): void {
    this.deactivateActivity();
    (activity as InternalActivity).active = true;
  }

  private deactivateActivity(): void {
    const activeActivity = this._activityPartService.activeActivity;
    if (activeActivity) {
      (activeActivity as InternalActivity).active = false;
    }
  }

  private listenForActivityDeactivation(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter(() => !this._router.routerState.snapshot.root.children.some(it => it.outlet === ACTIVITY_OUTLET_NAME)),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.deactivateActivity();
      });
  }
}
