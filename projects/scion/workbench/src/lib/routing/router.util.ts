/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';

export namespace RouterUtils {

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
  export function substituteNamedParameters(path: string | null, params?: Map<string, any>): string | null {
    if (!path || !params?.size) {
      return path;
    }
    // A named parameter can be followed by another path segment (`/`), by a query param (`?` or `&`), by a matrix param (`;`)
    // or by the fragment part (`#`).
    return path.replace(/:([^/;&?#]+)/g, (match, $1) => params.has($1) ? params.get($1) : match) ?? path;
  }

  /**
   * Converts URL segments into an array of routable commands to be passed to the Angular router for navigation.
   */
  export function segmentsToCommands(segments: UrlSegment[]): any[] {
    return segments.reduce((acc: any[], segment: UrlSegment) => {
      return acc.concat(
        segment.path || [],
        segment.parameters && Object.keys(segment.parameters).length ? segment.parameters : [],
      );
    }, []);
  }

  /**
   * Parses the given path including any matrix parameters into URL segments.
   */
  export function parsePath(router: Router, path: string): UrlSegment[] {
    const tree: UrlTree = router.parseUrl(path);
    const segmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    if (!segmentGroup) {
      throw Error(`[RouteMatchError] Cannot match any route for '${path}'.`);
    }
    return segmentGroup.segments;
  }

  /**
   * Resolves to the actual {@link ActivatedRouteSnapshot} loaded into a router outlet.
   *
   * The route that is reported as the activated route of an outlet, or the route that is passed to a guard
   * or resolver, is not always the route that is actually loaded into the outlet, for example, if the route
   * is a child of a component-less route.
   */
  export function resolveActualRouteSnapshot(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    return route.firstChild ? resolveActualRouteSnapshot(route.firstChild) : route;
  }

  /**
   * Looks for requested data on given route, or its parent route(s) if not declared.
   */
  export function lookupRouteData<T>(activatedRoute: ActivatedRouteSnapshot, dataKey: string): T | undefined {
    return activatedRoute.pathFromRoot.reduceRight((resolvedData, route) => resolvedData ?? route.data[dataKey], undefined);
  }
}
