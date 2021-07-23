/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Routes, UrlSegment} from '@angular/router';
import {MicrofrontendViewComponent} from '../microfrontend-view/microfrontend-view.component';
import {ɵMicrofrontendRouteParams} from '@scion/workbench-client';

export namespace MicrofrontendViewRoutes {

  /**
   * Route prefix to identify routes of microfrontends.
   */
  export const ROUTE_PREFIX = '~';

  /**
   * Microfrontend routes config.
   */
  export const config: Routes = [
    {
      path: `${ROUTE_PREFIX}/:${ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID}`,
      component: MicrofrontendViewComponent,
    },
  ];

  /**
   * Extracts the capability id from the given microfrontend route, or throws if not given a microfrontend route.
   */
  export function extractCapabilityId(segments: UrlSegment[]): string {
    if (segments.length === 2 && segments[0].path === ROUTE_PREFIX) {
      return segments[1].path;
    }
    throw Error(`[NullMicrofrontendRouteError] Given URL segments do not match a microfrontend route. [segments=${segments.toString()}]`);
  }
}
