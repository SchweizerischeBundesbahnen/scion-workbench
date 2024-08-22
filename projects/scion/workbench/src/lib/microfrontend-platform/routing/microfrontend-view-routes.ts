/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, Params, Route, UrlMatcher, UrlMatchResult, UrlSegment, UrlSegmentGroup} from '@angular/router';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams} from '@scion/workbench-client';
import {inject, Injector} from '@angular/core';
import {Commands} from '../../routing/routing.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {WorkbenchLayouts} from '../../layout/workbench-layouts.util';
import {WorkbenchRouteData} from '../../routing/workbench-route-data';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';

/**
 * Provides functions and constants specific to microfrontend routes.
 */
export const MicrofrontendViewRoutes = {

  /**
   * Prefix to identify a microfrontend route.
   */
  ROUTE_PREFIX: '~',

  /**
   * Key for associating transient parameters with a navigation.
   */
  STATE_TRANSIENT_PARAMS: 'transientParams',

  /**
   * Custom URL matcher for microfrontend URLs, enabling transient parameters to be provided as regular route parameters.
   *
   * A microfrontend route consists of two segments:
   * 1. An identifier segment (`~`) to identify a microfrontend route.
   * 2. Capability segment to identify the microfrontend capability.
   *
   * Parameters are included in the second segment as matrix parameters.
   *
   * Example URL: `~/a538d2a;param1=value1;param2=value
   *
   * @see MicrofrontendViewRoutes.createMicrofrontendNavigateCommands
   */
  provideMicrofrontendRouteMatcher: (): UrlMatcher => {
    const injector = inject(Injector);

    return (segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult | null => {
      // Test if the path matches.
      const microfrontendRoute = MicrofrontendViewRoutes.parseMicrofrontendRoute(segments);
      if (!microfrontendRoute) {
        return null;
      }

      // Test if navigating a view.
      const outlet = route.data?.[WorkbenchRouteData.ɵoutlet];
      if (!WorkbenchLayouts.isViewId(outlet)) {
        return null;
      }

      const {layout} = injector.get(ɵWorkbenchRouter).getCurrentNavigationContext();
      const navigationState = layout.navigationState({viewId: outlet});
      const transientParams = navigationState[MicrofrontendViewRoutes.STATE_TRANSIENT_PARAMS] ?? {};
      const posParams = Object.entries(transientParams).map(([name, value]) => [name, new UrlSegment(value, {})]);

      return {
        consumed: segments,
        posParams: {
          ...Object.fromEntries(posParams),
          [ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]: segments[1],
        },
      };
    };
  },

  /**
   * Creates routing commands to navigate a microfrontend.
   *
   * Format: ['~', '<capabilityId>, {params}]
   *
   * @see MicrofrontendViewRoutes.provideMicrofrontendRouteMatcher
   */
  createMicrofrontendNavigateCommands: (viewCapabilityId: string, params: Params): Commands => {
    if (Object.keys(params).length) {
      return [MicrofrontendViewRoutes.ROUTE_PREFIX, viewCapabilityId, params];
    }
    else {
      return [MicrofrontendViewRoutes.ROUTE_PREFIX, viewCapabilityId];
    }
  },

  /**
   * Tests given URL to be a microfrontend route.
   */
  parseMicrofrontendRoute: (segments: UrlSegment[]): {capabilityId: string; params: Params} | null => {
    if (segments.length === 2 && segments[0].path === MicrofrontendViewRoutes.ROUTE_PREFIX) {
      return {
        capabilityId: segments[1].path,
        params: segments[1].parameters,
      };
    }
    return null;
  },

  /**
   * Splits given params into URL and transient params.
   */
  splitParams: (params: Params, capability: WorkbenchViewCapability): {urlParams: Params; transientParams: Params} => {
    const transientParamNames = new Set(capability.params?.filter(param => param.transient).map(param => param.name));

    return Object.entries(params).reduce((groups, [name, value]) => {
      if (transientParamNames.has(name)) {
        groups.transientParams[name] = value;
      }
      else {
        groups.urlParams[name] = value;
      }
      return groups;
    }, {urlParams: {} as Params, transientParams: {} as Params});
  },

  /**
   * Matches the route if target of a view capability (microfrontend) and the capability exists.
   */
  canMatchViewCapability: ((_route: Route, segments: UrlSegment[]): boolean => {
    const microfrontendRoute = MicrofrontendViewRoutes.parseMicrofrontendRoute(segments);
    if (!microfrontendRoute) {
      return false;
    }

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return true; // match until started the microfrontend platform to avoid flickering.
    }

    return inject(ManifestObjectCache).hasCapability(microfrontendRoute.capabilityId);
  }) satisfies CanMatchFn,
} as const;
