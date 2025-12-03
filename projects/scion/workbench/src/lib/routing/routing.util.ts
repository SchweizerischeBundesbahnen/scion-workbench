/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, ActivationStart, ChildrenOutletContexts, Event, NavigationStart, OutletContext, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment, UrlSegmentGroup, UrlTree} from '@angular/router';
import {Commands} from '../routing/routing.model';
import {inject} from '@angular/core';
import {EMPTY, iif, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pairwise, race, switchMap} from 'rxjs';
import {filter, map, startWith, take} from 'rxjs/operators';
import {DialogOutlet, isDialogOutlet, isPartOutlet, isPopupOutlet, isViewOutlet, PartOutlet, PopupOutlet, ViewOutlet, WorkbenchOutlet} from '../workbench.identifiers';

/**
 * Provides utility functions for router operations.
 */
export const Routing = {

  /**
   * Converts given URL segments into an array of commands that can be passed to the Angular router for navigation.
   */
  segmentsToCommands: (segments: UrlSegment[]): Commands => {
    const commands = new Array<unknown>();

    segments.forEach(segment => {
      if (segment.path) {
        commands.push(segment.path);
      }
      if (Object.keys(segment.parameters).length) {
        commands.push(segment.parameters);
      }
    });

    return commands;
  },

  /**
   * Constructs URL segments from given commands, resolving any relative navigational symbols.
   *
   * This function must be called within an injection context.
   */
  commandsToSegments: (commands: Commands, options?: {relativeTo?: ActivatedRoute | null}): UrlSegment[] => {
    // Ignore `relativeTo` for absolute commands.
    const isAbsolutePath = typeof commands[0] === 'string' && commands[0].startsWith('/');
    const relativeTo = isAbsolutePath ? null : (options?.relativeTo ?? null);

    // Angular throws the error 'NG04003: Root segment cannot have matrix parameters' when passing an empty-path command
    // followed by a matrix params object, but not when passing matrix params as the first command. For consistency, when
    // passing matrix params as the first command, we prepend an empty-path for Angular to throw the same error.
    if (typeof commands[0] === 'object' && (!relativeTo || Routing.hasEmptyPathFromRoot(relativeTo))) {
      commands = ['', ...commands];
    }

    const urlTree = inject(Router).createUrlTree(commands, {relativeTo});
    return urlTree.root.children[relativeTo?.pathFromRoot[1]?.outlet ?? PRIMARY_OUTLET]?.segments ?? [];
  },

  /**
   * Parses the given path and matrix parameters into an array of commands that can be passed to the Angular router for navigation.
   *
   * This function must be called within an injection context.
   */
  pathToCommands: (path: string): Commands => {
    const urlTree = inject(Router).parseUrl(path);
    const segmentGroup = urlTree.root.children[PRIMARY_OUTLET] as UrlSegmentGroup | undefined;
    if (!segmentGroup?.segments) {
      throw Error(`[RouterError] Cannot match any routes for path '${path}'.`);
    }
    return Routing.segmentsToCommands(segmentGroup.segments);
  },

  /**
   * Resolves the effective (=leaf) {@link ActivatedRoute} activated in a router outlet.
   *
   * Depending on the route hierarchy, when navigating to a child route with component-less parent routes, the route of an outlet may not be the effectively activated child route.
   */
  resolveEffectiveRoute: (route: ActivatedRoute): ActivatedRoute => {
    return route.firstChild ? Routing.resolveEffectiveRoute(route.firstChild) : route;
  },

  /**
   * Resolves the effective (=leaf) {@link OutletContext} of a router outlet.
   *
   * Depending on the route hierarchy, when navigating to a child route with component-less parent routes, the context of an outlet may not be the effectively activated child context.
   */
  resolveEffectiveOutletContext: (outletContext: OutletContext | null): OutletContext | null => {
    const childOutletContext = outletContext?.children.getContext(PRIMARY_OUTLET);
    return childOutletContext ? Routing.resolveEffectiveOutletContext(childOutletContext) : outletContext;
  },

  /**
   * Looks for requested data on given route, or its parent route(s) if not found.
   */
  lookupRouteData: <T>(activatedRoute: ActivatedRouteSnapshot, dataKey: string): T | undefined => {
    return activatedRoute.pathFromRoot.reduceRight<T | undefined>((resolvedData, route) => resolvedData ?? route.data[dataKey] as T | undefined, undefined);
  },

  /**
   * Reads outlets from given URL.
   */
  parseOutlets: parseOutlets,

  /**
   * Tests if given route has an empty path from root.
   */
  hasEmptyPathFromRoot(route: ActivatedRoute): boolean {
    return route.snapshot.pathFromRoot.flatMap(route => route.url).filter(segment => segment.path.length).length === 0;
  },

  /**
   * Observes the route activation for the specified outlet.
   *
   * The observable emits after the previous component has been destroyed (if any) but before constructing the new component.
   *
   * Options to control when to emit:
   * - `routeChange`: Emit only when navigating the outlet to a different route.
   * - `routeOrParamChange`: Emit when navigating the outlet to a different route or changing params (named path params or matrix params).
   * - `always`: Emit at every navigation, even if the outlet is not the target of the navigation.
   *
   * This method must be called within an injection context.
   *
   * Note: Listening for route activations/deactivations on the router outlet alone is insufficient for nested routes, as the outlet does not report
   * activations/deactivations of child routes.
   *
   * @param outlet - Specifies the outlet to observe.
   * @param options - Controls when to emit the observable.
   * @return An observable emitting a tuple of the previous and current route snapshots.
   */
  activatedRoute$(outlet: string, options: {emitOn: 'routeChange' | 'routeOrParamChange' | 'always'}): Observable<[ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]> {
    const router = inject(Router);
    const childrenOutletContexts = inject(ChildrenOutletContexts);

    const onNavigationStart$ = router.events.pipe(filterNavigationStart());
    const onActivationStart$ = router.events.pipe(filterActivationStart(), filterByOutlet(outlet));
    const onActivationEnd$ = router.events.pipe(filterActivationEnd(), filterByOutlet(outlet));

    // On each navigation start (`NavigationStart`), subscribe to the outlet's `ActivationStart` event and then to the outlet's deactivate event,
    // enabling continuing of the execution chain after the previous component has been destroyed.
    //
    // If `emitOn` is set to `always`, additionally subscribe to the outlet's `ActivationEnd` event, since no activation (`ActivationStart`) occurs if
    // the outlet is not navigated (e.g., navigating another outlet or updating query params).
    //
    // Note that Angular activates nested routes from parent to child and deactivates them from child to parent, triggering multiple `ActivationStart`
    // and `ActivationEnd` events. For the outlet, the latest `ActivationStart` and the first `ActivationEnd` events are relevant.
    //
    // `ActivationStart` is emitted only if the outlet is actually navigated (route or parameter change), whereas `ActivationEnd` is always emitted.
    //
    // If a navigation is currently in progress, start immediately, allowing subscriptions even during ongoing navigation, such as after the navigation
    // has started.
    return iif(() => !router.currentNavigation(), onNavigationStart$, onNavigationStart$.pipe(startWith(undefined)))
      .pipe(
        // Subscribe to the outlet's `ActivationStart` (and also `ActivationEnd` if the `emitOn` option is set to `always`).
        switchMap(() => options.emitOn === 'always' ? race(onActivationStart$, onActivationEnd$.pipe(take(1))) : onActivationStart$),
        map(event => event.snapshot),
        startWith(null as unknown as ActivatedRouteSnapshot), // initialize pairwise operator
        pairwise(),
        switchMap(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]): Observable<[ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]> => {
          // If the route hasn't changed and `emitOn` is set to `always` or `routeOrParamChange`, emit immediately since no deactivation will occur.
          const routeChanged = previous?.routeConfig !== current.routeConfig;
          if (!routeChanged) {
            return options.emitOn === 'routeChange' ? EMPTY : of([previous, current]);
          }

          // If there's no previously activated component in the outlet, emit immediately since no deactivation will occur.
          const outletContext = Routing.resolveEffectiveOutletContext(childrenOutletContexts.getContext(outlet));
          if (!outletContext?.outlet?.isActivated) {
            return of([previous, current]);
          }

          // Delay emission until the previously activated component has been destroyed by subscribing to the outlet's deactivation event.
          // Nested routes activate from parent to child, canceling "deactivation" subscriptions of parent outlets, so only the deactivation of the actual outlet is emitted.
          return outletContext.outlet.deactivateEvents!.pipe(map(() => [previous, current]));
        }),
      );

    /**
     * Filters {@link NavigationStart} router events.
     */
    function filterNavigationStart(): OperatorFunction<Event | RouterEvent, NavigationStart> {
      return filter((event: Event | RouterEvent): event is NavigationStart => event instanceof NavigationStart);
    }

    /**
     * Filters {@link ActivationStart} router events.
     */
    function filterActivationStart(): OperatorFunction<Event | RouterEvent, ActivationStart> {
      return filter((event: Event | RouterEvent): event is ActivationStart => event instanceof ActivationStart);
    }

    /**
     * Filters {@link ActivationEnd} router events. This event is emitted for each outlet regardless of whether it has been navigated or not.
     */
    function filterActivationEnd(): OperatorFunction<Event | RouterEvent, ActivationEnd> {
      return filter((event: Event | RouterEvent): event is ActivationEnd => event instanceof ActivationEnd);
    }

    /**
     * Filters router events for the specified outlet.
     */
    function filterByOutlet<T extends ActivationStart | ActivationEnd>(outlet: string): MonoTypeOperatorFunction<T> {
      return filter(event => event.snapshot.pathFromRoot[1]?.outlet === outlet);
    }
  },
} as const;

function parseOutlets(url: UrlTree, selector: {view: true}): Map<ViewOutlet, UrlSegment[]>;
function parseOutlets(url: UrlTree, selector: {part: true}): Map<PartOutlet, UrlSegment[]>;
function parseOutlets(url: UrlTree, selector: {dialog: true}): Map<DialogOutlet, UrlSegment[]>;
function parseOutlets(url: UrlTree, selector: {popup: true}): Map<PopupOutlet, UrlSegment[]>;
function parseOutlets(url: UrlTree, selector: {view?: true; part?: true; dialog?: true; popup?: true}): Map<WorkbenchOutlet, UrlSegment[]>;
function parseOutlets(url: UrlTree, selector: {view?: true; part?: true; dialog?: true; popup?: true}): Map<WorkbenchOutlet, UrlSegment[]> {
  const outlets = new Map<WorkbenchOutlet, UrlSegment[]>();
  Object.entries(url.root.children).forEach(([outlet, segmentGroup]) => {
    if (selector.view && isViewOutlet(outlet)) {
      outlets.set(outlet, segmentGroup.segments);
    }
    if (selector.part && isPartOutlet(outlet)) {
      outlets.set(outlet, segmentGroup.segments);
    }
    if (selector.dialog && isDialogOutlet(outlet)) {
      outlets.set(outlet, segmentGroup.segments);
    }
    if (selector.popup && isPopupOutlet(outlet)) {
      outlets.set(outlet, segmentGroup.segments);
    }
  });
  return outlets;
}
