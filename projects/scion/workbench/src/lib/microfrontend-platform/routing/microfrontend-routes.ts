/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, Params, Routes, UrlSegment} from '@angular/router';
import {MicrofrontendViewComponent} from '../microfrontend-view/microfrontend-view.component';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams} from '@scion/workbench-client';
import {Qualifier} from '@scion/microfrontend-platform';
import {WB_STATE_DATA} from '../../routing/routing.constants';
import {Dictionaries, Dictionary} from '@scion/toolkit/util';

export namespace MicrofrontendViewRoutes {

  /**
   * Route prefix to identify routes of microfrontends.
   */
  const ROUTE_PREFIX = '~';

  /**
   * Key for accessing transient params from the navigational state.
   */
  export const TRANSIENT_PARAMS_STATE_KEY = 'transientParams';

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
      /**
       * In the microfrontend view integration, parameters can be marked as 'transient'. Transient parameters are not added as matrix
       * parameters to the URL but passed via navigational state to the component by {@link NavigationStateResolver}. The component can
       * access them as resolved data via {@link ActivatedRouteSnapshot#data[WB_STATE_DATA]} under the {@link MicrofrontendViewRoutes.TRANSIENT_PARAMS_STATE_KEY} key.
       *
       * However, by default, the Angular router resolves data only when matrix or URL parameters of the route change. For this reason,
       * we configure the microfrontend route to evaluate resolvers also on query parameter change, which allows updating transient parameters
       * without changed matrix or URL parameters.
       */
      runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
  ];

  /**
   * Parses the params of a given microfrontend route. Throws if not a valid microfrontend route.
   *
   * Note that transient parameters are not part of the URL segments and are only returned if passing a {@link ActivatedRouteSnapshot} object.
   */
  export function parseParams(route: ActivatedRouteSnapshot | UrlSegment[]): MicrofrontendRouteParams {
    const segments = Array.isArray(route) ? route : route.url;
    if (segments.length === 2 && segments[0].path === ROUTE_PREFIX) {
      return {
        viewCapabilityId: segments[1].path,
        qualifier: segments[0].parameters,
        urlParams: segments[1].parameters,
        transientParams: Array.isArray(route) ? {} : route.data[WB_STATE_DATA]?.[MicrofrontendViewRoutes.TRANSIENT_PARAMS_STATE_KEY] || {},
      };
    }
    throw Error(`[NullMicrofrontendRouteError] Given URL segments do not match a microfrontend route. [segments=${segments.toString()}]`);
  }

  /**
   * Splits given params into two groups of URL and transient params.
   *
   * URL params are passed with the URL, transient params via transient state. Transient params do not survive a page reload.
   */
  export function splitParams(params: Map<string, any> | Dictionary | undefined, viewCapability: WorkbenchViewCapability): {urlParams: Dictionary; transientParams: Dictionary} {
    const transientParamNames = new Set(viewCapability.params?.filter(param => param.transient).map(param => param.name));

    return Object.entries(Dictionaries.coerce(params)).reduce((groups, [name, value]) => {
      if (transientParamNames.has(name)) {
        groups.transientParams[name] = value;
      }
      else {
        groups.urlParams[name] = value;
      }
      return groups;
    }, {urlParams: {} as Dictionary, transientParams: {} as Dictionary});
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

export interface MicrofrontendRouteParams {
  viewCapabilityId: string;
  qualifier: Params;
  urlParams: Params;
  transientParams: Params;
}
