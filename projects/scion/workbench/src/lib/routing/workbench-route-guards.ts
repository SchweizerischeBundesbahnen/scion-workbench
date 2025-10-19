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
import {isDialogOutlet, isPartOutlet, isViewOutlet, isWorkbenchOutlet, PartId} from '../workbench.identifiers';
import {APP_IDENTITY, MicrofrontendPlatform, PlatformState, Qualifier, QualifierMatcher} from '@scion/microfrontend-platform';
import {MicrofrontendPartNavigationData} from '../microfrontend-platform/microfrontend-part/microfrontend-part-navigation-data';
import {ManifestObjectCache} from '../microfrontend-platform/manifest-object-cache.service';
import {Beans} from '@scion/toolkit/bean-manager';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from '../microfrontend-platform/microfrontend-part/microfrontend-part-routes';

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

export function canMatchWorkbenchHostPart(qualifier: Qualifier): CanMatchFn {
  return (route, segments): boolean => {

    const outlet = inject(WORKBENCH_OUTLET, {optional: true});

    const layout1 = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part1 = layout1.part({partId: outlet as PartId}, {orElse: null});
    console.log('>>> hint', part1?.navigation?.hint);

    console.log('>>> wtf');
    if (!canMatchWorkbenchPart(MICROFRONTEND_PART_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    console.log('>>> a');

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return true; // match until started the microfrontend platform to avoid flickering.
    }
    console.log('>>> b');
    console.log('>>> eval');

    const partId = inject(WORKBENCH_OUTLET) as PartId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId});
    const {capabilityId} = part.navigation!.data as unknown as MicrofrontendPartNavigationData;
    const capability = inject(ManifestObjectCache).getCapability(capabilityId);
    if (!capability) {
      console.log('>>> no 1');
      return false;
    }

    const isHostProvider = capability.metadata?.appSymbolicName === Beans.get(APP_IDENTITY);
    if (!isHostProvider) {
      console.log('>>> no 2');
      return false;
    }
    console.log('>>> yes');
    return new QualifierMatcher(capability.qualifier).matches(qualifier);
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
