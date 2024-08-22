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
import {WorkbenchPopupDiff} from './workbench-popup-differ';
import {WorkbenchDialogDiff} from './workbench-dialog-differ';
import {WorkbenchLayout} from '../layout/workbench-layout';
import {WorkbenchMessageBoxDiff} from './workbench-message-box-differ';
import {WorkbenchViewOutletDiff} from './workbench-view-outlet-differ';

/**
 * Options to control the navigation.
 */
export interface WorkbenchNavigationExtras extends NavigationExtras {
  /**
   * Controls where to open the view. Default is `auto`.
   *
   * One of:
   * - 'auto':   Navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.
   * - 'blank':  Navigates in a new view.
   * - <viewId>: Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.
   */
  target?: ViewId | string | 'blank' | 'auto';
  /**
   * Controls which part to navigate views in.
   *
   * If target is `blank`, opens the view in the specified part.
   * If target is `auto`, navigates matching views in the specified part, or opens a new view in that part otherwise.
   *
   * If the specified part is not in the layout, opens the view in the active part, with the active part of the main area taking precedence.
   */
  partId?: string;
  /**
   * Sets a hint to control navigation, e.g., for use in a `CanMatch` guard to differentiate between routes with an identical path.
   *
   * For example, views of the initial layout or a perspective are usually navigated to the empty path route to avoid cluttering the URL,
   * requiring a navigation hint to differentiate between the routes. See {@link canMatchWorkbenchView} for an example.
   *
   * Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.
   *
   * @see canMatchWorkbenchView
   */
  hint?: string;
  /**
   * Instructs the router to activate the view. Default is `true`.
   */
  activate?: boolean;
  /**
   * Specifies where to insert the view into the tab bar. Has no effect if navigating an existing view. Default is after the active view.
   */
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  /**
   * Associates data with a view navigation.
   *
   * Unlike matrix parameters, navigation data is stored in the layout and not added to the path, allowing data to be passed to empty path navigations.
   *
   * Data must be JSON serializable. Data can be read from {@link WorkbenchView.navigationData}.
   */
  data?: NavigationData;
  /**
   * Passes state to a view navigation.
   *
   * State is not persistent, unlike {@link data}, it is only added to the browser's session history to support back/forward browser navigation.
   * State can be read from {@link WorkbenchView.state} or from the browser's session history via `history.state`.
   */
  state?: ViewState;
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
   * Workbench layout elements added or removed by the current navigation.
   */
  layoutDiff: WorkbenchLayoutDiff;
  /**
   * View auxiliary routes to register or unregister by the current navigation.
   */
  viewOutletDiff: WorkbenchViewOutletDiff;
  /**
   * Popups added or removed by the current navigation.
   */
  popupDiff: WorkbenchPopupDiff;
  /**
   * Dialogs added or removed by the current navigation.
   */
  dialogDiff: WorkbenchDialogDiff;
  /**
   * Message boxes added or removed by the current navigation.
   */
  messageBoxDiff: WorkbenchMessageBoxDiff;

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
export type Commands = any[];

/**
 * URL segments of views contained in the workbench layout.
 */
export type ViewOutlets = {[viewId: ViewId]: UrlSegment[]};

/**
 * States associated with view navigations.
 */
export type ViewStates = {[viewId: ViewId]: ViewState};

/**
 * State passed to a view navigation.
 *
 * State is not persistent, unlike {@link data}, it is only added to the browser's session history to support back/forward browser navigation.
 * State can be read from {@link WorkbenchView.state} or from the browser's session history via `history.state`.
 */
export type ViewState = {[key: string]: unknown};

/**
 * Data associated with a view navigation.
 *
 * Data can be read from {@link WorkbenchView.navigationData}. Data must be JSON serializable.
 */
export type NavigationData = {[key: string]: unknown};

/**
 * Signature of a function to modify the workbench layout.
 *
 * The router will invoke this function with the current workbench layout. The layout has methods for modifying it.
 * The layout is immutable, so each modification creates a new instance. Use the instance for further modifications and finally return it.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ## Workbench Layout
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.
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
 * @return Modified layout, or `null` to cancel navigation.
 */
export type NavigateFn = (layout: WorkbenchLayout) => Promise<WorkbenchLayout | null> | WorkbenchLayout | null;
