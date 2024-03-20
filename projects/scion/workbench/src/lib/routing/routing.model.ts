/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents an ordered list of path segments instructing the router which route to navigate to.
 *
 * A command can be either a `string` or an object literal. String literals represent path segments, while object literals associate data
 * with the preceding path segment. Multiple path segments can be combined into a single command, separated by a forward slash. The first
 * path segment supports the usage of navigational symbols such as `/`, `./`, or `../`.
 *
 * Example:
 * - Navigate to the path 'path/to/view', passing two parameters:
 *   ['path', 'to', 'view', {param1: 'value1', param2: 'value2'}]
 * - Alternative syntax using a combined segment:
 *   ['path/to/view', {param1: 'value1', param2: 'value2'}]
 */
export type Commands = any[];

/**
 * Navigational view states associated with a workbench navigation.
 */
export type ViewStates = {[viewId: string]: ViewState};

/**
 * State associated with a view navigation.
 *
 * State is written to the browser session history, not to the URL, so will be lost on page reload.
 *
 * State can be read from {@link WorkbenchView.state}, or the browser's session history via `history.state`.
 */
export type ViewState = {[key: string]: unknown};
