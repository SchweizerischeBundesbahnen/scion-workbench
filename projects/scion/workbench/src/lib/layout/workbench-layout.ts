/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Commands, NavigationData, ViewState} from '../routing/routing.model';
import {ActivatedRoute} from '@angular/router';

/**
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is
 * displayed in views.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * Multiple layouts, called perspectives, are supported. Perspectives can be switched. Only one perspective is active at a time.
 * Perspectives share the same main area, if any.
 *
 * The layout is an immutable object that provides methods to modify the layout. Modifications have no
 * side effects. Each modification creates a new layout instance that can be used for further modifications.
 */
export interface WorkbenchLayout {

  /**
   * Adds a part with the given id to this layout. Position and size are expressed relative to a reference part.
   *
   * @param id - Unique id of the part. Use {@link MAIN_AREA} to add the main area.
   * @param relativeTo - Specifies the reference part to lay out the part.
   * @param options - Controls how to add the part to the layout.
   * @param options.activate - Controls whether to activate the part. Default is `false`.
   * @return a copy of this layout with the part added.
   */
  addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;

  /**
   * Adds a view to the specified part.
   *
   * @param id - The id of the view to add.
   * @param options - Controls how to add the view to the layout.
   * @param options.partId - References the part to which to add the view.
   * @param options.position - Specifies the position where to insert the view. The position is zero-based. Default is `end`.
   * @param options.activateView - Controls whether to activate the view. Default is `false`.
   * @param options.activatePart - Controls whether to activate the part that contains the view. Default is `false`.
   * @return a copy of this layout with the view added.
   */
  addView(id: string, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): WorkbenchLayout;

  /**
   * Navigates the specified view based on the provided array of commands and extras.
   *
   * A command can be a string or an object literal. A string represents a path segment, an object literal associates matrix parameters with the preceding segment.
   * Multiple segments can be combined into a single command, separated by a forward slash.
   *
   * By default, navigation is absolute. Set `relativeTo` in extras for relative navigation.
   *
   * Usage:
   * ```
   * layout.navigateView(viewId, ['path', 'to', 'view', {param1: 'value1', param2: 'value2'}]);
   * layout.navigateView(viewId, ['path/to/view', {param1: 'value1', param2: 'value2'}]);
   * ```
   *
   * @param id - Identifies the view for navigation.
   * @param commands - Instructs the router which route to navigate to.
   * @param extras - Controls navigation.
   * @param extras.hint - Sets a hint to control navigation, e.g., for use in a `CanMatch` guard to differentiate between routes with an identical path.
   *                      For example, views of the initial layout or a perspective are usually navigated to the empty path route to avoid cluttering the URL,
   *                      requiring a navigation hint to differentiate between the routes. See {@link canMatchWorkbenchView} for an example.
   *                      Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.
   * @param extras.relativeTo - Specifies the route for relative navigation, supporting navigational symbols such as '/', './', or '../' in the commands.
   * @param extras.data - Associates data with a view navigation.
   *                      Unlike matrix parameters, navigation data is stored in the layout and not added to the path, allowing data to be passed to empty path navigations.
   *                      Data must be JSON serializable. Data can be read from {@link WorkbenchView.navigationData}.
   * @param extras.state - Passes state to a view navigation.
   *                       State is not persistent, unlike {@link data}, it is only added to the browser's session history to support back/forward browser navigation.
   *                       State can be read from {@link WorkbenchView.state} or from the browser's session history via `history.state`.
   * @param extras.cssClass - Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   * @return a copy of this layout with the view navigated.
   */
  navigateView(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute; data?: NavigationData; state?: ViewState; cssClass?: string | string[]}): WorkbenchLayout;

  /**
   * Removes given view from the layout.
   *
   * - If the view is active, the last used view is activated.
   * - If the view is the last view in the part, the part is removed unless it is the last part in its grid or a structural part.
   *
   * @param id - Specifies the id of the view to remove.
   * @return a copy of this layout with the view removed.
   */
  removeView(id: string): WorkbenchLayout;

  /**
   * Removes given part from the layout.
   *
   * If the part is active, the last used part is activated.
   *
   * @param id - The id of the part to remove.
   * @return a copy of this layout with the part removed.
   */
  removePart(id: string): WorkbenchLayout;

  /**
   * Moves a view to a different part or moves it within a part.
   *
   * @param id - The id of the view to be moved.
   * @param targetPartId - The id of the part to which to move the view.
   * @param options - Controls moving of the view.
   * @param options.position - Specifies the position where to move the view in the target part. The position is zero-based. Default is `end` when moving the view to a different part.
   * @param options.activateView - Controls if to activate the view. Default is `false`.
   * @param options.activatePart - Controls if to activate the target part. Default is `false`.
   * @return a copy of this layout with the view moved.
   */
  moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): WorkbenchLayout;

  /**
   * Activates the given view.
   *
   * @param id - The id of the view which to activate.
   * @param options - Controls view activation.
   * @param options.activatePart - Controls whether to activate the part that contains the view. Default is `false`.
   * @return a copy of this layout with the view activated.
   */
  activateView(id: string, options?: {activatePart?: boolean}): WorkbenchLayout;

  /**
   * Activates the given part.
   *
   * @param id - The id of the part which to activate.
   * @return a copy of this layout with the part activated.
   */
  activatePart(id: string): WorkbenchLayout;
}

/**
 * Describes how to lay out a part relative to another part.
 */
export interface ReferencePart {
  /**
   * Specifies the part which to use as the reference part to lay out the part.
   * If not set, the part will be aligned relative to the root of the workbench layout.
   */
  relativeTo?: string;
  /**
   * Specifies the side of the reference part where to add the part.
   */
  align: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Specifies the proportional size of the part relative to the reference part.
   * The ratio is the closed interval [0,1]. If not set, defaults to `0.5`.
   */
  ratio?: number;
}

/**
 * Identifies the part that represents the main area.
 *
 * Refer to this part to align parts relative to the main area.
 */
export const MAIN_AREA: MAIN_AREA = 'main-area';

/**
 * Represents the type of the constant {@link MAIN_AREA}.
 */
export type MAIN_AREA = 'main-area';
