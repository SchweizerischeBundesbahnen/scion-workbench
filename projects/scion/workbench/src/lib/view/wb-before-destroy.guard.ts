/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {WbBeforeDestroy} from '../workbench.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';

/**
 * Invokes 'wbBeforeDestroy' lifecycle hook, if applicable.
 */
@Injectable()
export class WbBeforeDestroyGuard implements CanDeactivate<any | WbBeforeDestroy> {

  constructor(private _wbRouter: WorkbenchRouter) {
  }

  /**
   * Microfrontend routes are configured to evaluate resolvers and guards on every query parameter change, see {@link MicrofrontendViewRoutes.config}.
   *
   * Since {@link WorkbenchRouter.closeViews} closes one view at a time and a new layout is created for every navigation in {@link PartsLayout.serialize}, this means that
   * this guard will be called even for views that are not being closed. Therefore we need to make sure that we call `wbBeforeDestroy` only for the view to be actually closed.
   */
  public canDeactivate(component: any | WbBeforeDestroy,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component && typeof component.wbBeforeDestroy === 'function' && this.isCurrentViewBeingClosed(currentRoute.outlet)) {
      return component.wbBeforeDestroy();
    }

    return true;
  }

  private isCurrentViewBeingClosed(currentView: string) {
    return this._wbRouter.getCurrentNavigationContext().layoutDiff.removedViews.indexOf(currentView) >= 0;
  }
}
