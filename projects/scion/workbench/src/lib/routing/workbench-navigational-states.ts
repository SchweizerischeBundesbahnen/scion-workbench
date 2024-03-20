/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Navigation, NavigationExtras, Router} from '@angular/router';
import {ViewState, ViewStates} from './routing.model';
import {inject} from '@angular/core';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';

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
   * Resolves navigational state associated with a view.
   *
   * TODO [WB-LAYOUT] Remove when migrated to the new Router API as state is retained in layout.
   */
  resolveViewState: (viewId: string): ViewState | undefined => {
    const currentNavigation = inject(Router).getCurrentNavigation();
    return (currentNavigation && WorkbenchNavigationalStates.fromNavigation(currentNavigation)?.viewStates[viewId]) ?? inject(WorkbenchViewRegistry).get(viewId, {orElse: null})?.state;
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
   * View states to be associated with the navigation.
   */
  viewStates: ViewStates;
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
