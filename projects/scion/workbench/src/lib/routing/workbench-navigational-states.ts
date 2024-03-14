/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionary} from '@scion/toolkit/util';
import {Navigation, NavigationExtras} from '@angular/router';

/**
 * Provides methods to associate {@link WorkbenchNavigationalState} with a navigation.
 */
export const WorkbenchNavigationalStates = {

  /**
   * Returns workbench-specific state associated with given navigation, or `null` if not a workbench navigation.
   */
  fromNavigation: (navigation: Navigation): WorkbenchNavigationalState | null => {
    return navigation.extras?.state?.[WORKBENCH_NAVIGATION_STATE_KEY] ?? null;
  },

  /**
   * Associates workbench-specific state with given navigation extras.
   */
  addToNavigationExtras: (extras: NavigationExtras, state: WorkbenchNavigationalState): void => {
    extras.state = {
      ...extras.state,
      [WORKBENCH_NAVIGATION_STATE_KEY]: state,
    };
  },
} as const;

/**
 * Represents workbench-specific state associated with a navigation.
 */
export interface WorkbenchNavigationalState {
  /**
   * Serialized workbench grid.
   *
   * Note: The main area grid is not passed as navigational state, but as query parameter {@link MAIN_AREA_LAYOUT_QUERY_PARAM}.
   */
  workbenchGrid: string;
  /**
   * Indicates whether to maximize the main area.
   */
  maximized: boolean;
  /**
   * View state to be associated with the navigation.
   * View state can be read from {@link ActivatedRoute.data} using the key {@link WorkbenchRouteData.state}.
   */
  viewStates: {
    [viewId: string]: Dictionary;
  };
}

/**
 * Keys for associating state with a view navigation.
 */
export const WorkbenchNavigationalViewStates = {
  /**
   * Key for associating CSS class(es) with a view state.
   */
  cssClass: 'ɵcssClass',
} as const;

/**
 * Key for associating workbench-specific state with a navigation.
 *
 * @private
 */
const WORKBENCH_NAVIGATION_STATE_KEY = 'ɵworkbench';
