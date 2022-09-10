/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, ɵEmptyOutletComponent} from '@angular/router';
import {ACTIVITY_OUTLET_NAME} from '../workbench.constants';
import {WbRouteReuseProvider} from './wb-route-reuse-strategy.service';
import {Injectable} from '@angular/core';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {Defined} from '@scion/toolkit/util';

/**
 * Provides reuse keys for activity routes to not destroy associated activity component
 * when switching between activities.
 */
@Injectable()
export class WbActivityRouteReuseProvider implements WbRouteReuseProvider {

  private readonly _active: boolean;

  constructor(workbenchModuleConfig: WorkbenchModuleConfig) {
    this._active = Defined.orElse(workbenchModuleConfig.reuseActivityRoutes, true);
  }

  public computeReuseKey(route: ActivatedRouteSnapshot): any {
    if (!this._active) {
      return null;
    }

    const hierarchy = route.pathFromRoot;

    // This provider handles activity routes only.
    if (!hierarchy.map(it => it.outlet).includes(ACTIVITY_OUTLET_NAME)) {
      return null; // not an activity route
    }

    // Used to workaround Angular issues #13869 and #20114.
    if (hierarchy[hierarchy.length - 1].component === ɵEmptyOutletComponent) {
      return null;
    }

    return hierarchy
      .reduce((path, routeSnapshot) => [...path, ...routeSnapshot.url.map(it => it.path)], new Array<string>())
      .join('/');
  }
}
