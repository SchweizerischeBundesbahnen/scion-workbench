/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WbBeforeDestroy } from '../workbench.model';

/**
 * Invokes 'wbBeforeDestroy' lifecycle hook, if applicable.
 */
@Injectable()
export class WbBeforeDestroyGuard implements CanDeactivate<any> {

  public canDeactivate(component: any,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const it = component as WbBeforeDestroy;
    if (it && typeof it.wbBeforeDestroy === 'function') {
      return component.wbBeforeDestroy();
    }

    return true;
  }
}
