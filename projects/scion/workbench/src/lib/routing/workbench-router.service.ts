/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NavigationExtras} from '@angular/router';
import {Injectable} from '@angular/core';
import {Commands, NavigateFn, WorkbenchNavigationExtras} from './routing.model';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';

/**
 * Enables navigation of workbench views and modification of the workbench layout.
 *
 * A view is a visual workbench element for displaying content side-by-side or stacked. A view can be navigated to any route.
 *
 * A view can inject `ActivatedRoute` to obtain parameters passed to the navigation and/or read data associated with the route.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchRouter})
export abstract class WorkbenchRouter {

  /**
   * Navigates views based on the provided array of commands and extras. This method is similar to Angular's `Router.navigate(...)`, but with a view as the navigation target.
   *
   * A command can be a string or an object literal. A string represents a path segment, an object literal associates matrix parameters with the preceding segment.
   * Multiple segments can be combined into a single command, separated by a forward slash.
   *
   * By default, navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.
   * This behavior can be changed by setting an explicit navigation target in navigation extras.
   *
   * By default, navigation is absolute. Set `relativeTo` in extras for relative navigation.
   *
   * The router supports for closing views matching the routing commands by setting `close` in navigation extras.
   *
   * ### Usage
   * ```
   * inject(WorkbenchRouter).navigate(['team', 33, 'user', 11]);
   * inject(WorkbenchRouter).navigate(['team/11/user', userName, {details: true}]); // multiple static segments can be merged into one
   * inject(WorkbenchRouter).navigate(['teams', {selection: 33'}]); // matrix parameter `selection` with the value `33`.
   * ```
   *
   * @see WorkbenchRouterLinkDirective
   */
  public abstract navigate(commands: Commands, extras?: WorkbenchNavigationExtras): Promise<boolean>;

  /**
   * Performs changes to the current workbench layout.
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
   * @param onNavigate - Specifies the callback to modify the layout.
   * @param extras - Controls how to perform the navigation.
   * @see NavigateFn
   */
  public abstract navigate(onNavigate: NavigateFn, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean>;
}
