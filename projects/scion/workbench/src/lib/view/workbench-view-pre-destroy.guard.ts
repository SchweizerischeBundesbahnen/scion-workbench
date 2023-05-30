/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkbenchViewPreDestroy} from '../workbench.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';

/**
 * Invokes 'WorkbenchViewPreDestroy' lifecycle hook, if applicable.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewPreDestroyGuard implements CanDeactivate<any | WorkbenchViewPreDestroy> {

  constructor(private _workbenchRouter: WorkbenchRouter) {
  }

  /**
   * Routes can be configured to run resolvers and guards on every navigation. See {@link Route.runGuardsAndResolvers}.
   *
   * In particular, we configure the microfrontend routes that way to pass transient parameters to the view. See {@link provideMicrofrontendRoutes}.
   * As a consequence, this guard will be called even if the component should not be destroyed. Therefore, we must make sure that we call `onWorkbenchViewPreDestroy`
   * only when the view is actually about to be closed.
   */
  public canDeactivate(component: any | WorkbenchViewPreDestroy,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component && typeof component.onWorkbenchViewPreDestroy === 'function' && this.isAboutToBeRemoved(currentRoute.outlet)) {
      return component.onWorkbenchViewPreDestroy();
    }

    return true;
  }

  private isAboutToBeRemoved(currentViewId: string): boolean {
    return this._workbenchRouter.getCurrentNavigationContext()?.layoutDiff.removedViews.includes(currentViewId) ?? false;
  }
}
