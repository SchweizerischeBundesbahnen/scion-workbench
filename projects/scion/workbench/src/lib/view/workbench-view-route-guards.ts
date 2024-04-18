/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, CanDeactivateFn, CanMatchFn} from '@angular/router';
import {inject} from '@angular/core';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';
import {WorkbenchViewPreDestroy} from '../workbench.model';
import {WORKBENCH_AUXILIARY_ROUTE_OUTLET} from '../routing/workbench-auxiliary-routes-registrator.service';

/**
 * Matches the route if target of a workbench view and navigating with the given hint.
 *
 * Can be used to differentiate between routes with an identical path. For example, the views of the initial layout or a perspective
 * are usually navigated to the empty path route to avoid cluttering the URL. A hint can be set when navigating the view to match a
 * particular route.
 *
 * ### Example:
 *
 * The following routes both match the empty path, but only if navigated with a specific hint.
 * ```ts
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchView('navigator')], component: NavigatorComponent},
 *   {path: '', canMatch: [canMatchWorkbenchView('outline')], component: OutlineComponent},
 * ];
 * ```
 *
 * The following example navigates to the `OutlineComponent`, passing a hint to match the route.
 * ```ts
 * inject(WorkbenchRouter).navigate([], {hint: 'outline'});
 * ```
 */
export function canMatchWorkbenchView(navigationHint: string): CanMatchFn;
/**
 * Matches the route if, or if not target of a workbench view.
 *
 * Can be used to guard the application's root route from matching an empty path view navigation.
 */
export function canMatchWorkbenchView(canMatch: boolean): CanMatchFn;
export function canMatchWorkbenchView(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return WorkbenchLayouts.isViewId(outlet);
      case false:
        return !WorkbenchLayouts.isViewId(outlet);
      default: { // hint
        if (!WorkbenchLayouts.isViewId(outlet)) {
          return false;
        }

        const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
        const view = layout.view({viewId: outlet}, {orElse: null});
        return view?.navigation?.hint === condition;
      }
    }
  };
}

/**
 * Matches if the view has been navigated (or cannot be found).
 *
 * The view cannot be found during initial navigation as the workbench layout is loaded asynchronously.
 */
export const canMatchNotFoundPage: CanMatchFn = (): boolean => {
  const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

  if (!WorkbenchLayouts.isViewId(outlet)) {
    throw Error(`[ViewError] CanMatchFn must be installed on a view auxiliary route. [outlet=${outlet}]`);
  }

  const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
  const view = layout.view({viewId: outlet}, {orElse: null});
  return !view || !!view.navigation;
};

/**
 * Prevents deactivation of the view if prevented by the view component.
 */
export const canDeactivateView: CanDeactivateFn<unknown> = ((component: unknown | null, route: ActivatedRouteSnapshot) => {
  const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

  if (!WorkbenchLayouts.isViewId(outlet)) {
    throw Error(`[ViewError] CanDeactivateFn must be installed on a view auxiliary route. [outlet=${outlet}]`);
  }

  // Test if the view component implements `onWorkbenchViewPreDestroy`.
  const viewComponent = component as WorkbenchViewPreDestroy;
  if (typeof viewComponent?.onWorkbenchViewPreDestroy !== 'function') {
    return true;
  }

  // Depending on the route configuration, this guard may be called even if the component is not to be closed.
  // Therefore, we need to check if the view is actually being closed before invoking the `onWorkbenchViewPreDestroy`
  // lifecycle hook. See {@link Route.runGuardsAndResolvers}.
  const isToBeClosed = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layoutDiff.removedViews.includes(outlet) ?? false;
  if (!isToBeClosed) {
    return true;
  }

  return viewComponent.onWorkbenchViewPreDestroy();
});
