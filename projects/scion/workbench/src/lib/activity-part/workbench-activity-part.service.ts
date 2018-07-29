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
import { NavigationEnd, Router, RouterEvent, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { ACTIVITY_OUTLET_NAME } from '../workbench.constants';
import { WbActivityDirective } from './wb-activity.directive';
import { InternalWorkbenchRouter } from '../routing/workbench-router.service';
import { UrlSegmentGroup } from '@angular/router/src/url_tree';
import { filter, takeUntil } from 'rxjs/operators';

@Injectable()
export class WorkbenchActivityPartService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _activeActivityPath: string | null;

  public activities: WbActivityDirective[] = [];

  constructor(private _router: Router, private _wbRouter: InternalWorkbenchRouter) {
    // Register all primary routes as activity auxiliary routes
    const routes = this._wbRouter.createAuxiliaryRoutesFor(ACTIVITY_OUTLET_NAME);
    this._wbRouter.replaceRouterConfig([...this._router.config, ...routes]);

    // Compute the active activity when a navigation ends successfully
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe((event: RouterEvent) => {
        this._activeActivityPath = this.parseActivityPathElseNull(event.url);
      });
  }

  /**
   * Returns the activity which is currently toggled.
   */
  public get activeActivity(): WbActivityDirective | null {
    if (!this._activeActivityPath) {
      return null;
    }

    return this.activities
      .filter(it => it.target === 'activity-panel')
      .find(it => it.path === this._activeActivityPath) || null;
  }

  /**
   * Returns true if the specified activity is the active activity.
   */
  public isActive(activity: WbActivityDirective): boolean {
    return activity.path === this._activeActivityPath;
  }

  /**
   * Activates the given activity.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateActivity(activity: WbActivityDirective): Promise<boolean> {
    if (activity.target === 'activity-panel') {
      return this._router.navigate([{outlets: {[ACTIVITY_OUTLET_NAME]: this.isActive(activity) ? null : activity.commands}}], {
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

  private parseActivityPathElseNull(url: string): string | null {
    const activitySegmentGroup: UrlSegmentGroup = this._router
      .parseUrl(url)
      .root.children[ACTIVITY_OUTLET_NAME];

    if (!activitySegmentGroup) {
      return null; // no activity selected
    }

    return activitySegmentGroup.segments.map((it: UrlSegment) => it.path).join('/');
  }
}
