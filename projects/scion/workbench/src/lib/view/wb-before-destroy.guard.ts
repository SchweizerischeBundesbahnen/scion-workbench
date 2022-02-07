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
   * Routes can be configured to evaluate resolvers and guards on every query parameter change. See {@link Route.runGuardsAndResolvers}.
   *
   * In particular, we configure the microfrontend routes that way to pass transient parameters to the view. See {@link provideMicrofrontendRoutes}.
   * As a consequence, this guard will be called even if the component should not be destroyed. Therefore, we must make sure that we call `wbBeforeDestroy`
   * only when the view is actually about to be closed.
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

  private isCurrentViewBeingClosed(currentView: string): boolean {
    return this._wbRouter.getCurrentNavigationContext().layoutDiff.removedViews.indexOf(currentView) >= 0;
  }
}
