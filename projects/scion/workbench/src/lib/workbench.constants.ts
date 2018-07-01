import { InjectionToken } from '@angular/core';

/**
 * DI injection token to inject a router outlet name for {WbRouterOutletDirective}.
 *
 * This is due to a restriction of Angular {RouterOutlet} which does not support for dynamic router outlet names.
 */
export const ROUTER_OUTLET_NAME = new InjectionToken<string>('ROUTER_OUTLET_NAME');

/**
 * Represents the name of the activity router outlet.
 */
export const ACTIVITY_OUTLET_NAME = 'activity';

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
