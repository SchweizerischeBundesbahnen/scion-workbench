/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, Params, UrlSegment} from '@angular/router';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {Dictionaries, Dictionary} from '@scion/toolkit/util';
import {WorkbenchRouteData} from '../../routing/workbench-route-data';
import {MicrofrontendNavigationalStates} from './microfrontend-navigational-states';

/**
 * Provides microfrontend-related routing constants and functions.
 */
export const MicrofrontendViewRoutes = {

  /**
   * Route prefix to identify routes of microfrontends.
   */
  ROUTE_PREFIX: '~',

  /**
   * Tests if given route is a microfrontend route.
   */
  isMicrofrontendRoute: (route: ActivatedRouteSnapshot | UrlSegment[]): boolean => {
    const segments = Array.isArray(route) ? route : route.url;
    return segments.length === 2 && segments[0].path === MicrofrontendViewRoutes.ROUTE_PREFIX;
  },

  /**
   * Parses the params of a given microfrontend route. Throws if not a valid microfrontend route.
   *
   * Note that transient parameters are not part of the URL segments and are only returned if passing a {@link ActivatedRouteSnapshot} object.
   */
  parseParams: (route: ActivatedRouteSnapshot | UrlSegment[]): MicrofrontendRouteParams => {
    if (!MicrofrontendViewRoutes.isMicrofrontendRoute(route)) {
      throw Error(`[NullMicrofrontendRouteError] Given URL segments do not match a microfrontend route. [segments=${route.toString()}]`);
    }

    const segments = Array.isArray(route) ? route : route.url;
    return {
      viewCapabilityId: segments[1].path,
      urlParams: segments[1].parameters,
      transientParams: Array.isArray(route) ? {} : route.data[WorkbenchRouteData.state]?.[MicrofrontendNavigationalStates.transientParams] || {},
    };
  },

  /**
   * Splits given params into two groups of URL and transient params.
   *
   * URL params are passed with the URL, transient params via transient state. Transient params do not survive a page reload.
   */
  splitParams: (params: Map<string, any> | Dictionary | undefined, viewCapability: WorkbenchViewCapability): {urlParams: Dictionary; transientParams: Dictionary} => {
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
  },

  /**
   * Builds the command array to be passed to the workbench router for navigating to a microfrontend view.
   *
   * Format: ['~', '<capabilityId>, {params}]
   */
  buildRouterNavigateCommand: (viewCapabilityId: string, params: Params): any[] => {
    if (Object.keys(params).length) {
      return [MicrofrontendViewRoutes.ROUTE_PREFIX, viewCapabilityId, params];
    }
    else {
      return [MicrofrontendViewRoutes.ROUTE_PREFIX, viewCapabilityId];
    }
  },
} as const;

export interface MicrofrontendRouteParams {
  viewCapabilityId: string;
  urlParams: Params;
  transientParams: Params;
}
