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
export namespace WorkbenchRouteData {
  /**
   * Key to define the preferred part of a view.
   */
  export const part = 'ɵpart';
  /**
   * Key to define the title of a view in {@link Route.data}.
   */
  export const title = 'ɵtitle';
  /**
   * Key to define the heading of a view in {@link Route.data}.
   */
  export const heading = 'ɵheading';
  /**
   * Key to associate CSS class(es) with a view in {@link Route.data}, useful in end-to-end tests for locating views and view tabs.
   */
  export const cssClass = 'ɵcssClass';
  /**
   * Key for reading navigational state from {@link ActivatedRoute.data}.
   *
   * The state object contains user-defined state passed to navigation extras and workbench-specific state.
   * Workbench-specific state is associated with keys as defined in {@link WorkbenchNavigationalStates}.
   */
  export const state = 'ɵstate';
}
