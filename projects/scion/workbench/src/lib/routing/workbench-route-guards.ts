/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn} from '@angular/router';
import {inject} from '@angular/core';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {Routing} from './routing.util';
import {WORKBENCH_AUXILIARY_ROUTE_OUTLET} from './workbench-auxiliary-route-installer.service';

/**
 * Configures a route to only match workbench views navigated with a specific hint.
 *
 * Use as a `canMatch` guard in {@link Route} config to differentiate between routes with identical paths.
 * For example, multiple views can navigate to the same path while resolving to different routes, such as the empty path route to maintain a clean URL.
 *
 * Example for navigating a view to the 'SearchComponent':
 * ```ts
 * // Navigation
 * inject(WorkbenchRouter).navigate([], {hint: 'search'});
 *
 * // Routes
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchView('search')], component: SearchComponent},
 *   {path: '', canMatch: [canMatchWorkbenchView('outline')], component: OutlineComponent},
 * ];
 * ```
 */
export function canMatchWorkbenchView(navigationHint: string): CanMatchFn;
/**
 * Configures a route to only or never match workbench views.
 *
 * For example, can be used to guard the application's root route to not match empty path view navigation.
 */
export function canMatchWorkbenchView(canMatch: boolean): CanMatchFn;
export function canMatchWorkbenchView(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return Routing.isViewOutlet(outlet);
      case false:
        return !Routing.isViewOutlet(outlet);
      default: { // hint
        if (!Routing.isViewOutlet(outlet)) {
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
 * Configures a route to only match workbench parts navigated with a specific hint.
 *
 * Use as a `canMatch` guard in {@link Route} config to differentiate between routes with identical paths.
 * For example, multiple parts can navigate to the same path while resolving to different routes, such as the empty path route to maintain a clean URL.
 *
 * Example for navigating a part to the 'SearchComponent':
 * ```ts
 * inject(WorkbenchRouter).navigate(layout => {
 *   return layout.navigatePart('search', [], {hint: 'search'});
 * });
 *
 * // Routes
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchPart('search')], component: SearchComponent},
 *   {path: '', canMatch: [canMatchWorkbenchPart('outline')], component: OutlineComponent},
 * ];
 * ```
 */
export function canMatchWorkbenchPart(navigationHint: string): CanMatchFn;
/**
 * Configures a route to only or never match workbench parts.
 *
 * For example, can be used to guard the application's root route to not match empty path part navigation.
 */
export function canMatchWorkbenchPart(canMatch: boolean): CanMatchFn;
export function canMatchWorkbenchPart(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return Routing.isPartOutlet(outlet);
      case false:
        return !Routing.isPartOutlet(outlet);
      default: { // hint
        if (!Routing.isPartOutlet(outlet)) {
          return false;
        }

        const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
        const part = layout.part({partId: outlet}, {orElse: null});
        return part?.navigation?.hint === condition;
      }
    }
  };
}

/**
 * Matches the route based on the active perspective.
 *
 * Can be used to activate a different route based on the active perspective.
 */
export function canMatchWorkbenchPerspective(id: string): CanMatchFn {
  return (): boolean => {
    return inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout.perspectiveId === id;
  };
}

/**
 * Matches workbench parts and views that have been navigated.
 */
export const matchesIfNavigated: CanMatchFn = (): boolean => {
  const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});

  if (Routing.isViewOutlet(outlet)) {
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const view = layout.view({viewId: outlet}, {orElse: null});
    return !!view?.navigation;
  }
  if (Routing.isPartOutlet(outlet)) {
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId: outlet}, {orElse: null});
    return !!part?.navigation;
  }
  throw Error(`[WorkbenchError] Guard can only be installed on view or part auxiliary route. [outlet=${outlet}]`);
};
