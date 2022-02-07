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
import {WbRouteReuseProvider} from './routing/wb-route-reuse-strategy.service';

/**
 * DI injection token to inject a router outlet name for {WbRouterOutletDirective}.
 *
 * This is due to a restriction of Angular {RouterOutlet} which does not support for dynamic router outlet names.
 */
export const ROUTER_OUTLET_NAME = new InjectionToken<string>('ROUTER_OUTLET_NAME');

/**
 * Multi DI injection token to control which routes to reuse.
 *
 * @see WbRouteReuseProvider
 */
export const ROUTE_REUSE_PROVIDER = new InjectionToken<WbRouteReuseProvider>('ROUTE_REUSE_PROVIDER');

/**
 * DI injection token to ensure `WorkbenchModule.forRoot()` is not used in a lazy context.
 */
export const WORKBENCH_FORROOT_GUARD = new InjectionToken<void>('WORKBENCH_FORROOT_GUARD');

/**
 * Represents the name of the activity router outlet.
 */
export const ACTIVITY_OUTLET_NAME = 'activity';

/**
 * Represents the key which the activity is associated in data params.
 */
export const ACTIVITY_DATA_KEY = 'wb.activity';

/**
 * Specifies the prefix used to name viewpart references.
 */
export const VIEW_PART_REF_PREFIX = 'viewpart.';

/**
 * Specifies the prefix used to name views.
 */
export const VIEW_REF_PREFIX = 'view.';

/**
 * Specifies the prefix used to name popups.
 */
export const POPUP_REF_PREFIX = 'popup.';

/**
 * Name of the query parameter that contains the parts layout in the URL.
 */
export const PARTS_LAYOUT_QUERY_PARAM = 'parts';

/**
 * Property name of the view navigation state.
 */
export const VIEW_TARGET = 'scion.workbench.routing.viewTarget';

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
