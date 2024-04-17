/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UrlSegment} from '@angular/router';
import {ViewId} from '../view/workbench-view.model';

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
 * Navigational view states associated with a workbench navigation.
 */
export type ViewStates = {[viewId: ViewId]: ViewState};

/**
 * State associated with a view navigation.
 *
 * Navigational state is stored in the browser's session history, supporting back/forward navigation, but is lost on page reload.
 * Therefore, a view must be able to restore its state without relying on navigational state.
 *
 * Navigational state can be read from {@link WorkbenchView.state} or the browser's session history via `history.state`.
 */
export type ViewState = {[key: string]: unknown};
