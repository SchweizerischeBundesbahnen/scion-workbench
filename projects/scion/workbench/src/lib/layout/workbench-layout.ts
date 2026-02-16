/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Commands, NavigationData, NavigationState} from '../routing/routing.model';
import {ActivatedRoute} from '@angular/router';
import {ActivityId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';

/**
 * The workbench layout is an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
 * Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.
 *
 * A typical workbench application has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to
 * support the user's workflow.
 *
 * Multiple layouts, called perspectives, can be created. Users can switch between perspectives. Perspectives share the same main area, if any.
 *
 * The layout has methods for modifying it. The layout is immutable; each modification creates a new instance.
 */
export interface WorkbenchLayout {

  /**
   * Adds a part with the given id to this layout. Position and size are expressed relative to a reference part.
   *
   * A part can also be aligned relative to a docked part, enabling inline layouts within docked parts, such as splitting the docked parts into multiple sections.
   *
   * @param id - The id of the part to add. Use {@link MAIN_AREA} to add the main area.
   * @param relativeTo - Specifies the reference part to lay out the part.
   * @param extras - Controls how to add the part to the layout.
   * @return a copy of this layout with the part added.
   */
  addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, extras?: PartExtras): WorkbenchLayout;

  /**
   * Adds a part with the given id to this layout, docking it to the specified docking area.
   *
   * Docked parts can be minimized to create more space for the main content. Users cannot drag views into or out of docked parts.
   *
   * A part can be docked to the left, right, or bottom side of the workbench.
   * Each side has two docking areas: `left-top` and `left-bottom`, `right-top` and `right-bottom`, and `bottom-left` and `bottom-right`.
   * Parts added to the same area are stacked, with only one part active per stack. If there is an active part in both stacks of a side,
   * the two parts are split vertically or horizontally, depending on the side.
   *
   * A docked part may be navigated to display content, have views, or define a layout with multiple parts aligned relative to each other.
   *
   * @param id - The id of the part to add.
   * @param dockTo - Controls to which area to dock the part.
   * @param extras - Controls how to add the part to the layout.
   * @return a copy of this layout with the part added.
   */
  addPart(id: string, dockTo: DockingArea, extras: DockedPartExtras): WorkbenchLayout;

  /**
   * Navigates the specified part based on the provided array of commands and extras.
   *
   * Navigating a part displays content when its view stack is empty. A navigated part can still have views but won't display
   * navigated content unless its view stack is empty. Views cannot be dragged into parts displaying navigated content, except
   * for the main area part.
   *
   * A command can be a string or an object literal. A string represents a path segment, an object literal associates matrix parameters with the preceding segment.
   * Multiple segments can be combined into a single command, separated by a forward slash.
   *
   * By default, navigation is absolute. Set `relativeTo` in extras for relative navigation.
   *
   * Usage:
   * ```
   * layout.navigatePart(partId, ['path', 'to', 'part', {param 'value'}]);
   * layout.navigatePart(partId, ['path/to/part', {param: 'value'}]);
   * ```
   *
   * @param id - Identifies the part for navigation.
   * @param commands - Instructs the router which route to navigate to.
   * @param extras - Controls navigation:
   * @param extras.hint - Allows differentiation between routes with identical paths.
   *                      Multiple parts can navigate to the same path but still resolve to different routes, e.g., the empty-path route to maintain a clean URL.
   *
   *                      Example:
   *                      ```ts
   *                      import {canMatchWorkbenchPart} from '@scion/workbench';
   *
   *                      const routes = [
   *                         {
   *                           path: '',
   *                           component: Part1Component,
   *                           canMatch: [canMatchWorkbenchPart('hint-1')], // matches navigations with hint 'hint-1'
   *                         },
   *                         {
   *                           path: '',
   *                           component: Part2Component,
   *                           canMatch: [canMatchWorkbenchPart('hint-2')], // matches navigations with hint 'hint-1'
   *                         },
   *                       ];
   *                      ```
   * @param extras.relativeTo - Specifies the route for relative navigation, supporting navigational symbols such as '/', './', or '../' in the commands.
   * @param extras.data - Associates data with the navigation.
   *                      Unlike matrix parameters, navigation data is stored in the layout and not added to the URL, allowing data to be passed to an empty-path navigation.
   *                      Data must be JSON serializable. Data can be read from {@link WorkbenchPart.navigation.data}.
   * @param extras.state - Passes state to the navigation.
   *                       State is not persistent, unlike {@link data}; however, state is added to the browser's session history to support back/forward browser navigation.
   *                       State can be read from {@link WorkbenchPart.navigation.state} or from the browser's session history via `history.state`.
   * @param extras.cssClass - Specifies CSS class(es) to add to the part, e.g., to locate the part in tests.
   * @return a copy of this layout with the part navigated.
   */
  navigatePart(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): WorkbenchLayout;

  /**
   * Adds a view to the specified part.
   *
   * @param id - The id of the view to add.
   * @param extras - Controls how to add the view to the layout.
   * @param extras.partId - References the part to which to add the view.
   * @param extras.position - Specifies the position where to insert the view. The position is zero-based. Defaults to `end`.
   * @param extras.activateView - Controls whether to activate the view. Defaults to `false`.
   * @param extras.activatePart - Controls whether to activate the part that contains the view. Defaults to `false`.
   * @param extras.cssClass - Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   * @return a copy of this layout with the view added.
   */
  addView(id: string, extras: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): WorkbenchLayout;

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
   * layout.navigateView(viewId, ['path', 'to', 'view', {param 'value'}]);
   * layout.navigateView(viewId, ['path/to/view', {param: 'value'}]);
   * ```
   *
   * @param id - Identifies the view for navigation.
   * @param commands - Instructs the router which route to navigate to.
   * @param extras - Controls navigation:
   * @param extras.hint - Allows differentiation between routes with identical paths.
   *                      Multiple views can navigate to the same path but still resolve to different routes, e.g., the empty-path route to maintain a clean URL.
   *                      Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.
   *
   *                      Example route config matching routes based on the hint passed to the navigation:
   *                      ```ts
   *                      import {canMatchWorkbenchView} from '@scion/workbench';
   *
   *                      const routes = [
   *                        {
   *                          path: '',
   *                          component: View1Component,
   *                          canMatch: [canMatchWorkbenchView('hint-1')], // matches navigations with hint 'hint-1'
   *                        },
   *                        {
   *                          path: '',
   *                          component: View2Component,
   *                          canMatch: [canMatchWorkbenchView('hint-2')], // matches navigations with hint 'hint-2'
   *                        },
   *                      ];
   *                      ```
   * @param extras.relativeTo - Specifies the route for relative navigation, supporting navigational symbols such as '/', './', or '../' in the commands.
   * @param extras.data - Associates data with the navigation.
   *                      Unlike matrix parameters, navigation data is stored in the layout and not added to the URL, allowing data to be passed to an empty-path navigation.
   *                      Data must be JSON serializable. Data can be read from {@link WorkbenchView.navigation.data}.
   * @param extras.state - Passes state to the navigation.
   *                       State is not persistent, unlike {@link data}; however, state is added to the browser's session history to support back/forward browser navigation.
   *                       State can be read from {@link WorkbenchView.navigation.state} or from the browser's session history via `history.state`.
   * @param extras.cssClass - Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   * @return a copy of this layout with the view navigated.
   */
  navigateView(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): WorkbenchLayout;

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
   * @param options.position - Specifies the position where to move the view in the target part. The position is zero-based. Defaults to `end` when moving the view to a different part.
   * @param options.activateView - Controls if to activate the view. Defaults to `false`.
   * @param options.activatePart - Controls if to activate the target part. Defaults to `false`.
   * @return a copy of this layout with the view moved.
   */
  moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): WorkbenchLayout;

  /**
   * Activates the given view.
   *
   * @param id - The id of the view which to activate.
   * @param options - Controls view activation.
   * @param options.activatePart - Controls whether to activate the part that contains the view. Defaults to `false`.
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

  /**
   * Tests if given part is contained in the layout.
   */
  hasPart(id: string): boolean;

  /**
   * Tests if given view is contained in the layout.
   */
  hasView(id: string): boolean;

  /**
   * Applies a modification function to this layout, enabling conditional changes while maintaining method chaining.
   *
   * @param modifyFn - A function that takes the current layout and returns a modified layout.
   * @return The modified layout returned by the modify function.
   */
  modify(modifyFn: (layout: WorkbenchLayout) => WorkbenchLayout): WorkbenchLayout;
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
 * Controls the appearance and behavior of a part.
 */
export interface PartExtras {
  /**
   * Title displayed in the part bar.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;
  /**
   * Specifies CSS class(es) to add to the part, e.g., to locate the part in tests.
   */
  cssClass?: string | string[];
  /**
   * Controls whether to activate the part. Defaults to `false`.
   */
  activate?: boolean;
}

/**
 * Controls the appearance of a docked part and its toggle button.
 *
 * A docked part is a part that is docked to the left, right, or bottom side of the workbench.
 *
 * Docked parts can be minimized to create more space for the main content. Users cannot drag
 * views into or out of docked parts.
 */
export interface DockedPartExtras {
  /**
   * Icon (key) displayed in the toggle button.
   *
   * The actual icon is resolved through an {@link WorkbenchIconProviderFn} registered in {@link WorkbenchConfig.iconProvider}.
   *
   * If no icon provider is configured, the icon defaults to a Material Icon font ligature. The default icon provider requires
   * the application to include the Material icon font, for example in `styles.scss`, as follows:
   *
   * ```scss
   * @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');
   * ```
   *
   * The application can then reference icons from the Material Icons Font: https://fonts.google.com/icons
   */
  icon: string;
  /**
   * Label displayed in the toggle button.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  label: Translatable;
  /**
   * Tooltip displayed when hovering over the toggle button.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  tooltip?: Translatable;
  /**
   * Title displayed in the part bar.
   *
   * If not provided, defaults to {@link DockedPartExtras.label}. Set to `false` to not display a title.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable | false;
  /**
   * CSS class(es) to add to the docked part and its toggle button, e.g., to locate the part in tests.
   */
  cssClass?: string | string[];
  /**
   * Controls whether to activate the docked part. Defaults to `false`.
   */
  activate?: boolean;
  /**
   * Internal identifier for the docked part.
   *
   * @docs-private Not public API. For internal use only.
   */
  ɵactivityId?: ActivityId;
}

/**
 * A part can be docked to the left, right, top or bottom side of the workbench.
 *
 * Each side has two docking areas: `left-top` and `left-bottom`, `right-top` and `right-bottom`, `top-left` and `top-right`, and `bottom-left` and `bottom-right`.
 * Parts added to the same area are stacked, with only one part active per stack. If there is an active part in both stacks of a side,
 * the two parts are split vertically or horizontally, depending on the side.
 */
export interface DockingArea {
  /**
   * Controls where to dock a part.
   * - `left-top`: Dock to the top on the left side.
   * - `left-bottom`: Dock to the bottom on the left side.
   * - `right-top`: Dock to the top on the right side.
   * - `right-bottom`: Dock to the bottom on the right side.
   * - `top-left`: Dock to the left on the top side.
   * - `top-right`: Dock to the right on the top side.
   * - `bottom-left`: Dock to the left on the bottom side.
   * - `bottom-right`: Dock to the right on the bottom side.
   */
  dockTo: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Identifies the main area part in the workbench layout.
 *
 * Refer to this part to align parts relative to the main area.
 *
 * The main area is a special part that can be added to the layout. The main area is where the workbench opens views by default.
 * It is shared between perspectives and its layout is not reset when resetting perspectives.
 */
export const MAIN_AREA: MAIN_AREA = 'part.main-area';

/**
 * Represents the type of the {@link MAIN_AREA} constant.
 */
export type MAIN_AREA = 'part.main-area';

/**
 * Represents the alternative id of the main area part.
 *
 * @see MAIN_AREA
 */
export const MAIN_AREA_ALTERNATIVE_ID = 'main-area';

/**
 * Contains different versions of a workbench layout.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MWorkbenchLayout {
  /**
   * Layout before any user personalization (initial layout).
   */
  referenceLayout: {
    /**
     * @see WorkbenchLayoutSerializer.serializeGrids
     * @see WorkbenchLayoutSerializer.deserializeGrid
     */
    grids: {
      main: string;
      [activityId: ActivityId]: string;
    };
    /**
     * @see WorkbenchLayoutSerializer.serializeActivityLayout
     */
    activityLayout: string;
    /**
     * @see WorkbenchLayoutSerializer.serializeOutlets
     * @see WorkbenchLayoutSerializer.deserializeOutlets
     */
    outlets: string;
  };
  /**
   * Layout personalized by the user.
   */
  userLayout: {
    /**
     * @see WorkbenchLayoutSerializer.serializeGrids
     * @see WorkbenchLayoutSerializer.deserializeGrid
     */
    grids: {
      main: string;
      [activityId: ActivityId]: string;
    };
    /**
     * @see WorkbenchLayoutSerializer.serializeActivityLayout
     */
    activityLayout: string;
    /**
     * @see WorkbenchLayoutSerializer.serializeOutlets
     * @see WorkbenchLayoutSerializer.deserializeOutlets
     */
    outlets: string;
  };
}

/**
 * Signature of a function to provide a workbench layout.
 *
 * The workbench will invoke this function with a factory object to create the layout. The layout is immutable; each modification creates a new instance.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ## Workbench Layout
 * The workbench layout is an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
 * Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.
 *
 * The layout typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support
 * the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens views by default.
 * Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives.

 * ## Steps to create the layout
 * Start by adding parts to the layout. Parts can be docked to a specific area (`left-top`, `left-bottom`, `right-top`, `right-bottom`, `bottom-left`, `bottom-right`)
 * or aligned relative to each other. Views can be added to any part except the main area part. To display content, navigate parts and views to registered routes.
 *
 * To maintain a clean URL, navigate parts and views in the layout to empty-path routes and use a navigation hint for differentiation.
 * - Use the `canMatchWorkbenchPart` guard to match a route only for parts navigated with a particular hint.
 * - Use the `canMatchWorkbenchView` guard to match a route only for views navigated with a particular hint.
 *
 * ## Example
 * The following example defines a layout with a main area and four parts docked to the side:
 *
 * ```plain
 * +------+-----------+------+
 * |      |           |      |
 * |      |           |      |
 * | left | main area | right|
 * |      |           |      |
 * |      |           |      |
 * +------+-----------+------+
 * |          bottom         |
 * +-------------------------+
 * ```
 *
 * ```ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench({
 *       layout: (factory: WorkbenchLayoutFactory) => factory
 *         // Add parts to dock areas on the side.
 *         .addPart(MAIN_AREA)
 *         .addPart('navigator', {dockTo: 'left-top'}, {label: 'Navigator', icon: 'folder'})
 *         .addPart('find', {dockTo: 'bottom-left'}, {label: 'Find', icon: 'search'})
 *         .addPart('inventory', {dockTo: 'right-top'}, {label: 'Inventory', icon: 'inventory'})
 *         .addPart('notifications', {dockTo: 'right-bottom'}, {label: 'Notifications', icon: 'notifications'})
 *
 *         // Add views to parts.
 *         .addView('find1', {partId: 'find'})
 *         .addView('find2', {partId: 'find'})
 *         .addView('find3', {partId: 'find'})
 *
 *         // Navigate the main area to display a welcome page.
 *         .navigatePart(MAIN_AREA, [], {hint: 'welcome'})
 *
 *         // Navigate parts to display content.
 *         .navigatePart('navigator', [], {hint: 'navigator'})
 *         .navigatePart('inventory', ['path/to/inventory'])
 *         .navigatePart('notifications', [], {hint: 'notifications'})
 *
 *         // Navigate views to display content.
 *         .navigateView('find1', ['path/to/find'])
 *         .navigateView('find2', ['path/to/find'])
 *         .navigateView('find3', ['path/to/find'])
 *
 *         // Activate parts to open docked parts.
 *         .activatePart('navigator')
 *         .activatePart('find')
 *         .activatePart('inventory'),
 *     }),
 *   ],
 * });
 * ```
 *
 * The layout requires the following routes.
 *
 * ```ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {provideRouter} from '@angular/router';
 * import {canMatchWorkbenchView, canMatchWorkbenchPart} from '@scion/workbench';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideRouter([
 *      // Route for the "MAIN_AREA Part"
 *       {path: '', canMatch: [canMatchWorkbenchPart('welcome')], loadComponent: () => import('./welcome/welcome.component')},
 *       // Route for the "Navigator Part"
 *       {path: '', canMatch: [canMatchWorkbenchPart('navigator')], loadComponent: () => import('./navigator/navigator.component')},
 *       // Route for the "Find View"
 *       {path: 'path/to/find', loadComponent: () => import('./find/find.component')},
 *       // Route for the "Inventory Part"
 *       {path: 'path/to/inventory', loadComponent: () => import('./inventory/inventory.component')},
 *       // Route for the "Notifications Part"
 *       {path: '', canMatch: [canMatchWorkbenchPart('notifications')], loadComponent: () => import('./notifications/notifications.component')},
 *     ]),
 *   ],
 * });
 * ```
 */
export type WorkbenchLayoutFn = (factory: WorkbenchLayoutFactory) => Promise<WorkbenchLayout> | WorkbenchLayout;
