/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectionToken } from '@angular/core';
import { WbRouteReuseProvider } from './routing/wb-route-reuse-strategy.service';

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
 * Specifies the drag type to move views.
 */
export const VIEW_DRAG_TYPE = 'workbench/view';

/**
 * Specifies the prefix used to name viewpart references.
 */
export const VIEW_PART_REF_PREFIX = 'viewpart.';

/**
 * Specifies the prefix used to name viewreferences.
 */
export const VIEW_REF_PREFIX = 'view.';

/**
 * Specifies the HTTP query parameter name to set the viewpart grid in the URI.
 */
export const VIEW_GRID_QUERY_PARAM = 'viewgrid';

/**
 * Represents severity levels.
 */
export type Severity = 'info' | 'warn' | 'error';

/**
 * NLS texts used in Workbench.
 */
export const NLS_DEFAULTS = {
  messagebox_action_yes: 'Yes',
  messagebox_action_no: 'No',
  messagebox_action_ok: 'OK',
  messagebox_action_cancel: 'Cancel',
};
