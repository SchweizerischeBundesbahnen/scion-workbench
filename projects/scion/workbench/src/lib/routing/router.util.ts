/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRoute, ActivatedRouteSnapshot, PRIMARY_OUTLET, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {Commands} from '../routing/routing.model';
import {POPUP_ID_PREFIX, VIEW_ID_PREFIX} from '../workbench.constants';
import {inject} from '@angular/core';
import {ViewId} from '../view/workbench-view.model';

/**
 * Provides utility functions for router operations.
 */
export const RouterUtils = { // TODO [WB-LAYOUT] rename to Routers

  /**
   * Replaces named parameters in the given path with values contained in the given {@link Map}.
   * Named parameters begin with a colon (`:`) and are allowed in path segments, query parameters, matrix parameters
   * and the fragment part.
   *
   * Some examples about the usage of named parameters:
   * /segment/:param1/segment/:param2 // path params
   * /segment/segment;matrixParam1=:param1;matrixParam2=:param2 // matrix params
   * /segment/segment?queryParam1=:param1&queryParam2=:param2 // query params
   */
  substituteNamedParameters: (path: string | null, params?: Map<string, any>): string | null => {
    if (!path || !params?.size) {
      return path;
    }
    // A named parameter can be followed by another path segment (`/`), by a query param (`?` or `&`), by a matrix param (`;`)
    // or by the fragment part (`#`).
    return path.replace(/:([^/;&?#]+)/g, (match, $1) => params.has($1) ? params.get($1) : match) ?? path;
  },

  /**
   * Converts given URL segments into an array of routable commands that can be passed to the Angular router for navigation.
   */
  segmentsToCommands: (segments: UrlSegment[]): Commands => {
    const commands = new Array<any>();

    segments.forEach(segment => {
      if (segment.path) {
        commands.push(segment.path);
      }
      if (segment.parameters && Object.keys(segment.parameters).length) {
        commands.push(segment.parameters);
      }
    });

    return commands;
  },

  /**
   * Constructs URL segments from given commands, resolving any relative navigational symbols.
   *
   * This function must be called inside an injection context.
   */
  commandsToSegments: (commands: Commands, options?: {relativeTo?: ActivatedRoute | null}): UrlSegment[] => {
    if (!commands.filter(Boolean).length) {
      return [];
    }

    // Angular throws the error 'NG04003: Root segment cannot have matrix parameters' when passing an empty path command
    // followed by a matrix params object, but not when passing matrix params as the first command. For consistency, when
    // passing matrix params as the first command, we prepend an empty path for Angular to throw the same error.
    if (!options?.relativeTo && typeof commands[0] === 'object') {
      commands = ['', ...commands];
    }

    // TOOD [WB-LAYOUT] Consider adding a comment what is happening here.
    const urlTree = inject(Router).createUrlTree(commands, {relativeTo: options?.relativeTo});
    return urlTree.root.children[options?.relativeTo?.pathFromRoot[1]?.outlet ?? PRIMARY_OUTLET].segments;
  },

  /**
   * Parses the given path and matrix parameters into an array of routable commands that can be passed to the Angular router for navigation.
   *
   * This function must be called inside an injection context.
   */
  pathToCommands: (path: string): Commands => {
    const urlTree = inject(Router).parseUrl(path);
    const segments = urlTree.root.children[PRIMARY_OUTLET]?.segments;
    if (!segments) {
      throw Error(`[RouterError] Cannot match any routes for path '${path}'.`);
    }
    return RouterUtils.segmentsToCommands(segments);
  },

  /**
   * Resolves to the actual {@link ActivatedRouteSnapshot} loaded into a router outlet.
   *
   * The route that is reported as the activated route of an outlet, or the route that is passed to a guard
   * or resolver, is not always the route that is actually loaded into the outlet, for example, if the route
   * is a child of a component-less route.
   */
  resolveActualRouteSnapshot: (route: ActivatedRouteSnapshot): ActivatedRouteSnapshot => {
    return route.firstChild ? RouterUtils.resolveActualRouteSnapshot(route.firstChild) : route;
  },

  /**
   * Looks for requested data on given route, or its parent route(s) if not declared.
   */
  lookupRouteData: <T>(activatedRoute: ActivatedRouteSnapshot, dataKey: string): T | undefined => {
    return activatedRoute.pathFromRoot.reduceRight((resolvedData, route) => resolvedData ?? route.data[dataKey], undefined);
  },

  isPrimaryViewId: (viewId: string): viewId is ViewId => {
    return viewId.startsWith(VIEW_ID_PREFIX);
  },

  isViewOutlet: (outlet: string | undefined | null): outlet is ViewId => {
    return outlet?.startsWith(VIEW_ID_PREFIX) ?? false;
  },

  isPopupOutlet: (outlet: string | undefined | null): outlet is `popup.${string}` => {
    return outlet?.startsWith(POPUP_ID_PREFIX) ?? false;
  },

  isRootRoute: (route: Route): boolean => {
    const outlet = route.outlet ?? PRIMARY_OUTLET;
    return route.path === '' && outlet === PRIMARY_OUTLET;
  },

  parseViewOutlets: (url: UrlTree): Map<ViewId, UrlSegment[]> => {
    const viewOutlets = new Map<ViewId, UrlSegment[]>();
    Object.entries(url.root.children).forEach(([outlet, segmentGroup]) => {
      if (RouterUtils.isViewOutlet(outlet)) {
        viewOutlets.set(outlet, segmentGroup.segments);
      }
    });
    return viewOutlets;
  },
} as const;
