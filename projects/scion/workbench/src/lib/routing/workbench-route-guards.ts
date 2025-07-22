/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, Route, UrlSegment} from '@angular/router';
import {inject} from '@angular/core';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {WORKBENCH_OUTLET} from './workbench-auxiliary-route-installer.service';
import {isDialogOutlet, isPartOutlet, isViewOutlet, isWorkbenchOutlet} from '../workbench.identifiers';

/**
 * Configures a route to only match workbench views navigated with a specific hint.
 *
 * Use as a `canMatch` guard in {@link Route} config to differentiate between routes with identical paths.
 * For example, multiple views can navigate to the same path while resolving to different routes, such as the empty-path route to maintain a clean URL.
 *
 * Example for navigating a view to the 'SearchComponent':
 * ```ts
 * // Navigation
 * inject(WorkbenchRouter).navigate([], {hint: 'search'});
 * ```
 *
 * // Routes
 * ```ts
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
 * @see canMatchWorkbenchOutlet
 */
export function canMatchWorkbenchView(canMatch: boolean): CanMatchFn;
export function canMatchWorkbenchView(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return isViewOutlet(outlet);
      case false:
        return !isViewOutlet(outlet);
      default: { // hint
        if (!isViewOutlet(outlet)) {
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
 * For example, multiple parts can navigate to the same path while resolving to different routes, such as the empty-path route to maintain a clean URL.
 *
 * Example for navigating a part to the 'SearchComponent':
 * ```ts
 * inject(WorkbenchRouter).navigate(layout => {
 *   return layout.navigatePart('search', [], {hint: 'search'});
 * });
 * ```
 *
 * // Routes
 * ```ts
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
 * @see canMatchWorkbenchOutlet
 */
export function canMatchWorkbenchPart(canMatch: boolean): CanMatchFn;
export function canMatchWorkbenchPart(condition: string | boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});

    switch (condition) {
      case true:
        return isPartOutlet(outlet);
      case false:
        return !isPartOutlet(outlet);
      default: { // hint
        if (!isPartOutlet(outlet)) {
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
 * Configures a route to only or never match workbench dialogs.
 *
 * @see canMatchWorkbenchOutlet
 */
export function canMatchWorkbenchDialog(condition: boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});
    return isDialogOutlet(outlet) === condition;
  };
}

/**
 * Configures a route to only or never match workbench outlets.
 *
 * A workbench outlet can be a part, view, dialog, popup, or messagebox.
 *
 * Usage:
 * - Use `canMatchWorkbenchOutlet(false)` guard on the application's default route (`""`) to prevent matching workbench outlets, such as parts and views, avoiding infinite loops.
 * - Use `canMatchWorkbenchOutlet(true)` guard on view and part routes to prevent matching the primary router outlet.
 *
 * Example:
 *
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchOutlet, canMatchWorkbenchPart, canMatchWorkbenchView, WorkbenchComponent} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {
 *     path: '',
 *     canActivate: [authorizedGuard()],
 *     children: [
 *       // Default route
 *       {
 *         path: '',
 *         canMatch: [canMatchWorkbenchOutlet(false)],
 *         component: WorkbenchComponent,
 *       },
 *       // Workbench view and part routes
 *       {
 *         path: '',
 *         canMatch: [canMatchWorkbenchOutlet(true)],
 *         children: [
 *           {path: 'path/to/page1', component: ...},
 *           {path: 'path/to/page2', component: ...},
 *           {path: '', canMatch: [canMatchWorkbenchPart('hint-1')], component: ...},
 *           {path: '', canMatch: [canMatchWorkbenchView('hint-2')], component: ...},
 *           ...
 *         ],
 *       },
 *     ],
 *   },
 * ];
 * ```
 *
 * @see canMatchWorkbenchPart
 * @see canMatchWorkbenchView
 */
export function canMatchWorkbenchOutlet(matchWorkbenchOutlet: boolean): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});
    return matchWorkbenchOutlet ? isWorkbenchOutlet(outlet) : !isWorkbenchOutlet(outlet);
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
 * Matches the route only if it has been navigated.
 *
 * @internal
 */
export const matchesIfNavigated: CanMatchFn = (_route: Route, segments: UrlSegment[]): boolean => {
  const outlet = inject(WORKBENCH_OUTLET, {optional: true});

  if (isViewOutlet(outlet)) {
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const view = layout.view({viewId: outlet}, {orElse: null});
    return !!view?.navigation;
  }
  if (isPartOutlet(outlet)) {
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId: outlet}, {orElse: null});
    return !!part?.navigation;
  }
  return segments.length > 0;
};
