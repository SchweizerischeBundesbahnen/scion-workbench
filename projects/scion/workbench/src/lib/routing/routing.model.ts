/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NavigationExtras, UrlSegment} from '@angular/router';
import {ViewId} from '../view/workbench-view.model';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutDiff} from './workbench-layout-differ';
import {WorkbenchLayout} from '../layout/workbench-layout';
import {WorkbenchOutletDiff} from './workbench-outlet-differ';
import {WorkbenchOutlet} from '../workbench.constants';
import {PartId} from '../part/workbench-part.model';

/**
 * Options to control the navigation.
 */
export interface WorkbenchNavigationExtras extends NavigationExtras {
  /**
   * Controls where to open the view. Defaults to `auto`.
   *
   * One of:
   * - 'auto':   Navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.
   * - 'blank':  Opens a new view and navigates it.
   * - <viewId>: Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.
   */
  target?: ViewId | string | 'blank' | 'auto';
  /**
   * Controls in which part to navigate views.
   *
   * If {@link target} is `blank`, opens the view in the specified part.
   * If {@link target} is `auto`, navigates matching views in the specified part, or opens a new view in that part otherwise.
   *
   * If the specified part is not in the layout, opens the view in the active part, with the active part of the main area, if any, taking precedence.
   */
  partId?: PartId | string;
  /**
   * Allows differentiation between routes with identical paths.
   *
   * Multiple views can navigate to the same path but still resolve to different routes, e.g., the empty path route to maintain a clean URL.
   * Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.
   *
   * Example route config matching routes based on the hint passed to the navigation:
   * ```ts
   * import {canMatchWorkbenchView} from '@scion/workbench';
   *
   * const routes = [
   *   {
   *     path: '',
   *     component: View1Component,
   *     canMatch: [canMatchWorkbenchView('hint-1')], // matches navigations with hint 'hint-1'
   *   },
   *   {
   *     path: '',
   *     component: View2Component,
   *     canMatch: [canMatchWorkbenchView('hint-2')], // matches navigations with hint 'hint-2'
   *   },
   * ];
   * ```
   * @see canMatchWorkbenchView
   */
  hint?: string;
  /**
   * Instructs the router to activate the view. Defaults to `true`.
   */
  activate?: boolean;
  /**
   * Specifies where to insert the view into the tab bar. Has no effect if navigating an existing view. Defaults to after the active view.
   */
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  /**
   * Associates data with the navigation.
   *
   * Unlike matrix parameters, navigation data is stored in the layout and not added to the URL, allowing data to be passed to empty path navigations.
   *
   * Data must be JSON serializable. Data can be read from {@link WorkbenchView.navigation.data}.
   */
  data?: NavigationData;
  /**
   * Passes state to the navigation.
   *
   * State is not persistent, unlike {@link data}; however, state is added to the browser's session history to support back/forward browser navigation.
   * State can be read from {@link WorkbenchView.navigation.state} or from the browser's session history via `history.state`.
   */
  state?: NavigationState;
  /**
   * Closes views that match the specified path and navigation hint. Matrix parameters do not affect view resolution.
   * The path supports the asterisk wildcard segment (`*`) to match views with any value in a segment.
   * To close a specific view, set a view target instead of a path.
   */
  close?: boolean;
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}

/**
 * Contextual data of a workbench navigation available in the router during navigation.
 *
 * @see WorkbenchUrlObserver
 *
 * @internal
 */
export interface WorkbenchNavigationContext {
  /**
   * Layout to be applied after successful navigation.
   */
  layout: ɵWorkbenchLayout;
  /**
   * Layout before the navigation.
   */
  previousLayout: ɵWorkbenchLayout | null;
  /**
   * Parts and views added or removed by the current navigation.
   *
   * This diff is based on the layout elements. Do not use it to update auxiliary route registrations as not available during initial navigation.
   */
  layoutDiff: WorkbenchLayoutDiff;
  /**
   * Outlets added or removed by the current navigation.
   *
   * This diff is based on the outlets in the URL and layout elements. Use it to update auxiliary route registrations.
   */
  outletDiff: WorkbenchOutletDiff;

  /**
   * Reverts changes made during the navigation if it fails or is cancelled.
   */
  undoChanges(): void;

  /**
   * Runs post navigation actions.
   */
  runPostNavigationActions(): void;

  /**
   * Registers an action to be undone if the navigation fails or is cancelled.
   */
  registerUndoAction(action: () => void): void;

  /**
   * Registers an action to be executed after successful navigation.
   */
  registerPostNavigationAction(action: () => void): void;
}

/**
 * Represents an ordered list of path segments instructing the router which route to navigate to.
 *
 * A command can be a string or an object literal. A string represents a path segment, an object literal associates matrix parameters with the preceding segment.
 * Multiple segments can be combined into a single command, separated by a forward slash.
 *
 * The first path segment supports the usage of navigational symbols such as `/`, `./`, or `../`.
 *
 * Examples:
 * - Navigates to the path 'path/to/view', passing two parameters:
 *   ['path', 'to', 'view', {param1: 'value1', param2: 'value2'}]
 * - Alternative syntax using a combined segment:
 *   ['path/to/view', {param1: 'value1', param2: 'value2'}]
 */
export type Commands = readonly unknown[];

/**
 * URL segments of workbench elements contained in the workbench layout.
 */
export interface Outlets {
  [outlet: WorkbenchOutlet]: UrlSegment[];
}

/**
 * State associated with a navigation.
 */
export interface NavigationStates {
  [outlet: WorkbenchOutlet]: NavigationState;
}

/**
 * State passed to a navigation.
 *
 * State is not persistent, unlike {@link data}; however, state is added to the browser's session history to support back/forward browser navigation.
 */
export interface NavigationState {
  [key: string]: unknown;
}

/**
 * Data associated with a navigation. Data must be JSON serializable.
 */
export interface NavigationData {
  [key: string]: unknown;
}

/**
 * Signature of a function to modify the workbench layout.
 *
 * The router will invoke this function with the current workbench layout. The layout has methods for modifying it.
 * The layout is immutable; each modification creates a new instance.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ## Workbench Layout
 * The workbench layout is an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
 * Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.
 *
 * ## Example
 * The following example adds a part to the left of the main area, inserts a view and navigates it.
 *
 * ```ts
 * inject(WorkbenchRouter).navigate(layout => layout
 *   .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
 *   .addView('navigator', {partId: 'left'})
 *   .navigateView('navigator', ['path/to/view'])
 *   .activateView('navigator')
 * );
 * ```
 *
 * @param layout - Reference to the current workbench layout for modification.
 * @return Modified layout, or `null` to cancel the navigation.
 */
export type NavigateFn = (layout: WorkbenchLayout) => Promise<WorkbenchLayout | null> | WorkbenchLayout | null;
