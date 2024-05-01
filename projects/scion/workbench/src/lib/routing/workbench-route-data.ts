/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Keys for associating workbench-specific data with a route in {@link Route.data}.
 *
 * @see Route.data
 */
export const WorkbenchRouteData = {

  /**
   * Property to set the title of a view in {@link Route.data}.
   */
  title: 'ɵworkbenchViewTitle',

  /**
   * Property to set the heading of a view in {@link Route.data}.
   */
  heading: 'ɵworkbenchViewHeading',

  /**
   * Property to associate CSS class(es) with a view in {@link Route.data}, e.g., to locate the view in tests.
   */
  cssClass: 'ɵworkbenchViewCssClass',

  /**
   * @internal
   *
   * Property to obtain the outlet name of the route. This property is only set on the top-level route.
   *
   * Use if the route's injection context is not available, e.g., in a {@link UrlMatcher}.
   * Otherwise, the outlet can be injected using the {@link WORKBENCH_AUXILIARY_ROUTE_OUTLET} DI token,
   * even in child routes, e.g., in guards.
   */
  ɵoutlet: 'ɵworkbenchOutlet',
} as const;
