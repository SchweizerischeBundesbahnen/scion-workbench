/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Qualifier} from '@scion/microfrontend-platform';
import {Dictionary} from '@scion/toolkit/util';
import {Empty} from '../common/utility-types';
import {PartId} from '../workbench.identifiers';

/**
 * Enables navigation of workbench views.
 *
 * A view is a visual workbench element for displaying content side-by-side or stacked.
 *
 * A microfrontend provided as a view capability can be opened in a view. The qualifier differentiates between different
 * view capabilities. Declaring an intention allows for opening public view capabilities of other applications.
 *
 * @category Router
 * @category View
 */
export abstract class WorkbenchRouter {

  /**
   * Navigates to a microfrontend of a view capability based on the given qualifier and extras.
   *
   * By default, the router opens a new view if no view is found that matches the specified qualifier and required params. Optional parameters do not affect view resolution.
   * If one or more views match the qualifier and required params, they will be navigated instead of opening the microfrontend in a new view tab.
   * This behavior can be changed by setting an explicit navigation target in navigation extras.
   *
   * @param  qualifier - Identifies the view capability that provides the microfrontend to display in a view.
   *                     Passing an empty qualifier (`{}`) allows the microfrontend to update its parameters, restoring updated parameters when the page reloads.
   *                     Parameter handling can be controlled using the {@link WorkbenchNavigationExtras#paramsHandling} option.
   * @param  extras - Options to control navigation.
   * @return Promise that resolves to `true` on successful navigation, or `false` otherwise.
   */
  public abstract navigate(qualifier: Qualifier | Empty<Qualifier>, extras?: WorkbenchNavigationExtras): Promise<boolean>;
}

/**
 * Options to control the navigation.
 *
 * @category Router
 * @category View
 */
export interface WorkbenchNavigationExtras {
  /**
   * Passes data to the view.
   *
   * The view can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, any> | Dictionary;
  /**
   * Instructs the workbench router how to handle params in self-navigation.
   *
   * Self-navigation allows the microfrontend to update its parameters, restoring updated parameters when the page reloads.
   * Setting a `paramsHandling` strategy has no effect on navigations other than self-navigation. A self-navigation is
   * initiated by passing an empty qualifier.
   *
   * One of:
   * * `replace`: Replaces current parameters (default).
   * * `merge`:   Merges new parameters with current parameters, with new parameters of equal name overwriting existing parameters.
   *              A parameter can be removed by passing `undefined` as its value.
   */
  paramsHandling?: 'merge' | 'replace';
  /**
   * Controls where to open the view. Defaults to `auto`.
   *
   * One of:
   * - `auto`:   Navigates existing views that match the qualifier and required params, or opens a new view otherwise. Optional parameters do not affect view resolution.
   * - `blank`:  Opens a new view and navigates it.
   * - `<viewId>`: Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.
   */
  target?: string | 'blank' | 'auto';
  /**
   * Controls which part to navigate views in.
   *
   * If {@link target} is `blank`, opens the view in the specified part.
   * If {@link target} is `auto`, navigates matching views in the specified part, or opens a new view in that part otherwise.
   *
   * If the specified part is not in the layout, opens the view in the active part, with the active part of the main area, if any, taking precedence.
   */
  partId?: PartId | string;
  /**
   * Instructs the router to activate the view. Defaults to `true`.
   */
  activate?: boolean;
  /**
   * Closes views that match the specified qualifier and required parameters. Optional parameters do not affect view resolution.
   *
   * The parameters support the asterisk wildcard value (`*`) to match views with any value for a parameter.
   *
   * Only views for which the application has an intention can be closed.
   */
  close?: boolean;
  /**
   * Specifies where to insert the view into the tab bar. Has no effect if navigating an existing view. Defaults to after the active view.
   */
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}
