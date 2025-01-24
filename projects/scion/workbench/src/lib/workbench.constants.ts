/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';

/**
 * Represents the id prefix of parts.
 *
 * @see PartId
 */
export const PART_ID_PREFIX = 'part.';

/**
 * Represents the id prefix of views.
 *
 * @see ViewId
 */
export const VIEW_ID_PREFIX = 'view.';

/**
 * Represents the id prefix of popups.
 */
export const POPUP_ID_PREFIX = 'popup.';

/**
 * Represents the id prefix of dialogs.
 */
export const DIALOG_ID_PREFIX = 'dialog.';

/**
 * Represents the id prefix of message boxes.
 */
export const MESSAGE_BOX_ID_PREFIX = 'messagebox.';

/**
 * Format of a part outlet name.
 */
export type PartOutlet = `${typeof PART_ID_PREFIX}${string}`;

/**
 * Format of a view outlet name.
 */
export type ViewOutlet = `${typeof VIEW_ID_PREFIX}${number}`;

/**
 * Format of a popup outlet name.
 */
export type PopupOutlet = `${typeof POPUP_ID_PREFIX}${string}`;

/**
 * Format of a dialog outlet name.
 */
export type DialogOutlet = `${typeof DIALOG_ID_PREFIX}${string}`;

/**
 * Format of a messagebox outlet name.
 */
export type MessageBoxOutlet = `${typeof MESSAGE_BOX_ID_PREFIX}${string}`;

/**
 * Union of workbench outlets.
 */
export type WorkbenchOutlet = PartOutlet | ViewOutlet | PopupOutlet | DialogOutlet | MessageBoxOutlet;

/**
 * Name of the query parameter that contains the layout of the main area.
 */
export const MAIN_AREA_LAYOUT_QUERY_PARAM = 'main_area';

/**
 * Defines the context in which a viewtab is rendered.
 *
 * - `tab`: if rendered as view tab in the tabbar
 * - `list-item`:  if rendered as list item in the view list menu
 * - `drag-image`: if rendered as drag image while dragging a view tab
 */
export type ViewTabRenderingContext = 'tab' | 'list-item' | 'drag-image';

/**
 * DI token to inject the context in which the view tab is rendered.
 */
export const VIEW_TAB_RENDERING_CONTEXT = new InjectionToken<ViewTabRenderingContext>('VIEW_TAB_RENDERING_CONTEXT');

/**
 * Prefix used to identify an anonymous perspective that the workbench creates for views moved to a new window.
 */
export const ANONYMOUS_PERSPECTIVE_ID_PREFIX = 'anonymous.';
