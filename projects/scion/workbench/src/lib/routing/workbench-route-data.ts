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
   *
   * Use a {@link Translatable} to localize the title.
   */
  title: 'ɵworkbenchViewTitle',

  /**
   * Property to set the heading of a view in {@link Route.data}.
   *
   * Use a {@link Translatable} to localize the heading.
   */
  heading: 'ɵworkbenchViewHeading',

  /**
   * Property to associate CSS class(es) with a workbench element in {@link Route.data}, e.g., to locate it in tests.
   */
  cssClass: 'ɵworkbenchCssClass',
} as const;
