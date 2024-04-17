/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Navigation} from '@angular/router';
import {ViewStates} from './routing.model';

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
   * Creates a state object with workbench-specific data that can be passed to a workbench navigation.
   */
  create: (state: WorkbenchNavigationalState): {[key: string]: unknown} => {
    return {
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
   * View states to be associated with the navigation.
   */
  viewStates: ViewStates;
}

/**
 * Key for associating workbench-specific state with a navigation.
 */
const WORKBENCH_NAVIGATION_STATE_KEY = 'ɵworkbench';
