/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Params, Routes, UrlSegment} from '@angular/router';
import {MicrofrontendViewComponent} from '../microfrontend-view/microfrontend-view.component';
import {ɵMicrofrontendRouteParams} from '@scion/workbench-client';
import {Qualifier} from '@scion/microfrontend-platform';

export namespace MicrofrontendViewRoutes {

  /**
   * Route prefix to identify routes of microfrontends.
   */
  const ROUTE_PREFIX = '~';

  /**
   * Microfrontend routes config.
   *
   * Format: '~;{qualifier}/<viewCapabilityId>;{params}'
   *  - '{qualifier}' as matrix params of first URL segment (~)
   *  - '{params}' as matrix params of second URL segment (viewCapabilityId)
   */
  export const config: Routes = [
    {
      path: `${ROUTE_PREFIX}/:${ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID}`,
      component: MicrofrontendViewComponent,
    },
  ];

  /**
   * Parses a given microfrontend route. Throws if not a valid microfrontend route.
   */
  export function parseUrl(segments: UrlSegment[]): {viewCapabilityId: string; params: Params; qualifier: Params} {
    if (segments.length === 2 && segments[0].path === ROUTE_PREFIX) {
      return {
        viewCapabilityId: segments[1].path,
        qualifier: segments[0].parameters,
        params: segments[1].parameters,
      };
    }
    throw Error(`[NullMicrofrontendRouteError] Given URL segments do not match a microfrontend route. [segments=${segments.toString()}]`);
  }

  /**
   * Builds the command array to be passed to the workbench router for navigating to a microfrontend view.
   *
   * Format: ['~', {qualifier}, '<viewCapabilityId>', {params}]
   */
  export function buildRouterNavigateCommand(viewCapabilityId: string, qualifier: Qualifier, params: Params): any[] {
    const paramsCommand = Object.keys(params).length > 0 ? [params] : [];
    return [ROUTE_PREFIX, qualifier, viewCapabilityId, ...paramsCommand];
  }
}
