/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ACTIVITY_DATA_KEY, ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { InternalWorkbenchRouter } from '../routing/workbench-router.service';
import { Activity, InternalActivity } from './activity';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class WorkbenchActivityPartService {

  private _activities$ = new BehaviorSubject<Activity[]>([]);

  constructor(private _router: Router,
              private _wbRouter: InternalWorkbenchRouter,
              private _injector: Injector) {
  }

  /**
   * Returns the list of activities.
   */
  public get activities(): Activity[] {
    return this._activities$.value;
  }

  /**
   * Returns the list of activities as {Observable}, which emits when activities are added or removed.
   */
  public get activities$(): Observable<Activity[]> {
    return this._activities$;
  }

  /**
   * Creates an activity to be added to this service.
   */
  public createActivity(): Activity {
    return new InternalActivity(this._wbRouter, this._injector);
  }

  /**
   * Returns the activity which is currently active, or `null` otherwise.
   */
  public get activeActivity(): Activity | null {
    return this.activities.find(it => it.active) || null;
  }

  /**
   * Activates the given activity.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateActivity(activity: Activity): Promise<boolean> {
    if (activity.target === 'activity-panel') {
      return this._router.navigate([{outlets: {[ACTIVITY_OUTLET_NAME]: activity.active ? null : activity.commands}}], {
        queryParamsHandling: 'preserve',
      });
    }
    else if (activity.target === 'view') {
      return this._wbRouter.navigate(activity.commands, {activateIfPresent: false});
    }
    throw Error('[IllegalActivityTargetError] Target must be \'activity-panel\' or \'view\'');
  }

  /**
   * Adds an activity to the activity bar.
   */
  public addActivity(activity: Activity): void {
    const activities = [...this.activities, activity].sort((a1, a2) => (a1.position || 0) - (a2.position || 0));
    this._activities$.next(activities);
  }

  /**
   * Removes an activity from the activity bar.
   */
  public removeActivity(activity: Activity): void {
    const activities = this.activities.filter(it => it !== activity);
    this._activities$.next(activities);
  }

  /**
   * Returns the activity of the current routing context, or `null` if not in the routing context of an activity.
   */
  public getActivityFromRoutingContext(route: ActivatedRouteSnapshot): Activity {
    for (let testee = route; testee !== null; testee = testee.parent) {
      const activity = testee.data[ACTIVITY_DATA_KEY];
      if (activity) {
        return activity;
      }
    }

    return null;
  }
}
