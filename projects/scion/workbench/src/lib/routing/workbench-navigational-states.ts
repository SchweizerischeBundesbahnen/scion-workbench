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
import {NavigationStates} from './routing.model';
import {ActivityId} from '../activity/workbench-activity.model';

/**
 * Provides methods to associate {@link WorkbenchNavigationalState} with a navigation.
 */
export const WorkbenchNavigationalStates = {

  /**
   * Returns workbench-specific state associated with given navigation, or `null` if the navigation was not performed through the workbench router.
   */
  fromNavigation: (navigation: Navigation): WorkbenchNavigationalState | null => {
    return navigation.extras.state?.[WORKBENCH_NAVIGATION_STATE_KEY] as WorkbenchNavigationalState | undefined ?? null;
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
   * Arrangement of parts and views.
   */
  grids: {
    /**
     * Serialized main grid.
     */
    main: string;
    /**
     * Serialized activity grids.
     */
    [activityId: ActivityId]: string;
  };
  /**
   * Arrangement of activities.
   */
  activityLayout: string;
  /**
   * Identifies the perspective that is navigated.
   */
  perspectiveId?: string;
  /**
   * Provides navigation state of views contained in the workbench layout.
   */
  navigationStates: NavigationStates;
}

/**
 * Key for associating workbench-specific state with a navigation.
 */
const WORKBENCH_NAVIGATION_STATE_KEY = 'ɵworkbench';
