/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';

/**
 * DI injection token to ensure `WorkbenchModule.forRoot()` is not used in a lazy context.
 */
export const WORKBENCH_FORROOT_GUARD = new InjectionToken<void>('WORKBENCH_FORROOT_GUARD');

/**
 * Prefix for views that are target of a primary route.
 *
 * Views with an id that begins with the view prefix can be the target of any primary route. A primary route does not declare an outlet.
 * On the other hand, views with an id that does not begin with the view prefix can only be the target of secondary routes having the view
 * id as their target outlet.
 */
export const VIEW_ID_PREFIX = 'view.';

/**
 * Represents the id prefix of popups.
 */
export const POPUP_ID_PREFIX = 'popup.';

/**
 * Name of the query parameter that contains the layout of the main area.
 */
export const MAIN_AREA_LAYOUT_QUERY_PARAM = 'main_area';

/**
 * Defines the contexts in which a viewtab is rendered.
 *
 * - tabbar: as tab in the tabbar
 * - tabbar-dropdown: as item in the dropdown of not visible views
 * - drag-image: as drag image during a view drag operation
 */
export declare type ViewTabContext = 'tabbar' | 'tabbar-dropdown' | 'drag-image';

/**
 * DI injection token to inject the context in which the viewtab is rendered.
 */
export const VIEW_TAB_CONTEXT = new InjectionToken<ViewTabContext>('VIEW_TAB_CONTEXT');

/**
 * Prefix used to identify an anonymous perspective that the workbench creates for views moved to a new window.
 */
export const ANONYMOUS_PERSPECTIVE_ID_PREFIX = 'anonymous.';
