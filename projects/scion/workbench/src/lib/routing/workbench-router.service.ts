/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NavigationExtras, Router, UrlSegment, UrlTree} from '@angular/router';
import {Defined} from '@scion/toolkit/util';
import {Injectable, Injector, NgZone, OnDestroy, runInInjectionContext} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM} from '../workbench.constants';
import {WorkbenchLayoutDiff} from './workbench-layout-differ';
import {WorkbenchPopupDiff} from './workbench-popup-differ';
import {SingleTaskExecutor} from '../executor/single-task-executor';
import {firstValueFrom} from 'rxjs';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {RouterUtils} from './router.util';
import {Commands, ViewOutlets, ViewState} from './routing.model';
import {ViewId} from '../view/workbench-view.model';
import {UrlSegmentMatcher} from './url-segment-matcher';
import {Objects} from '../common/objects.util';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchRouter implements OnDestroy {

  private _singleTaskExecutor = new SingleTaskExecutor();

  /**
   * Holds the current navigational context during a workbench navigation, or `null` if no navigation is in progress.
   */
  private _currentNavigationContext: WorkbenchNavigationContext | null = null;

  constructor(private _router: Router,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _injector: Injector,
              private _zone: NgZone) {
    // Instruct the Angular router to process navigations that do not change the current URL, i.e., when only updating navigation state.
    // For example, the workbench grid is passed to the navigation as state, not as a query parameter. Without this flag set, changes to
    // the workbench grid would not be added to the browsing history stack.
    // Although the `onSameUrlNavigation` flag can be set per navigation via the navigation extras, this is not sufficient because the
    // Angular router ignores it when navigating back and forth in the browsing history.
    // See Angular router.ts#setUpLocationChangeListener and router.ts#navigateToSyncWithBrowser
    this._router.onSameUrlNavigation = 'reload';
  }

  /**
   * Navigates based on the provided array of commands, and is like 'Router.navigate(...)' but with a workbench view as the router outlet target.
   * Navigation is absolute unless providing a `relativeTo` route in navigational extras.
   *
   * By passing navigation extras, you can control navigation. By default, the router opens a new view tab if no view is found that matches the
   * specified path. Matrix parameters do not affect view resolution. If one (or more) view(s) match the specified path, they are navigated
   * instead of opening the view in a new view tab, e.g., to update matrix parameters.
   *
   * The router supports for closing views matching the routing commands by setting `close` in navigational extras.
   *
   * ### Commands
   * - Multiple static segments can be merged into one, e.g. `['/team/11/user', userName, {details: true}]`
   * - The first segment name can be prepended with `/`, `./`, or `../`
   * - Matrix parameters can be used to associate optional data with the URL, e.g. `['user', userName, {details: true}]`
   *   Matrix parameters are like regular URL parameters, but do not affect route and view resolution. Unlike query parameters, matrix parameters
   *   are not global but part of the routing path, which makes them suitable for auxiliary routes.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'user', 11]);
   * router.navigate(['team/11/user', userName, {details: true}]); // multiple static segments can be merged into one
   * router.navigate(['teams', {selection: 33'}]); // matrix parameter 'selection' with the value '33'.
   * ```
   *
   * @see WorkbenchRouterLinkDirective
   */
  public navigate(commands: Commands, extras: WorkbenchNavigationExtras = {}): Promise<boolean> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.navigate(commands, extras));
    }

    if (extras.close) {
      return this.ɵnavigate((layout: ɵWorkbenchLayout): ɵWorkbenchLayout | null => {
        if (extras.target) {
          if (commands.length) {
            throw Error(`[WorkbenchRouterError] Commands array must be empty if closing a view by id [commands=${commands}]`);
          }
          return layout.removeView(extras.target);
        }
        const urlSegments = RouterUtils.commandsToSegments(commands, {relativeTo: extras.relativeTo});
        return layout
          .views({
            segments: new UrlSegmentMatcher(urlSegments, {matchMatrixParams: false, matchWildcardPathSegment: true}),
            outlet: extras.outlet,
          })
          .reduce((layout, view) => layout.removeView(view.id), layout);
      });
    }

    return this.ɵnavigate((layout: ɵWorkbenchLayout): ɵWorkbenchLayout | null => {
      if (!commands.length && !extras.outlet) {
        throw Error(`[WorkbenchRouterError] Commands or outlet must be set`);
      }
      switch (extras.target ?? 'auto') {
        case 'blank': {
          return addView(layout.computeNextViewId(), layout);
        }
        case 'auto': {
          const urlSegments = RouterUtils.commandsToSegments(commands, {relativeTo: extras.relativeTo});
          const views = layout.views({
            segments: new UrlSegmentMatcher(urlSegments, {matchMatrixParams: false, matchWildcardPathSegment: false}),
            outlet: extras.outlet,
          });
          if (views.length) {
            return views.reduce((layout, view) => updateView(view.id, layout), layout);
          }
          else {
            return addView(layout.computeNextViewId(), layout);
          }
        }
        default: {
          const viewId = extras.target!;
          if (layout.hasView(viewId)) {
            return updateView(viewId, layout);
          }
          else {
            return addView(viewId, layout);
          }
        }
      }
    }, extras);

    /**
     * Creates the navigation for adding the specified view to the workbench layout.
     */
    function addView(viewId: string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
      return layout
        .addView(viewId, {
          partId: computeTargetPartId(extras, layout),
          position: extras.blankInsertionIndex ?? 'after-active-view',
          activateView: extras.activate ?? true,
        })
        .navigateView(viewId, commands, {
          relativeTo: extras.relativeTo,
          outlet: extras.outlet,
          cssClass: extras.cssClass,
          state: extras.state,
        });
    }

    /**
     * Creates the navigation for updating the path of the specified view.
     */
    function updateView(viewId: string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
      // TODO [WB-LAYOUT] consider activating view in navigation (additional flag in extras)
      if (extras.activate ?? true) {
        layout = layout.activateView(viewId);
      }

      return layout.navigateView(viewId, commands, {
        relativeTo: extras.relativeTo,
        outlet: extras.outlet,
        cssClass: extras.cssClass,
        state: extras.state,
      });
    }

    /**
     * Computes the target part based on the provided navigation extras. Defaults to the active part
     * if not specified in extras or not contained in the layout.
     */
    function computeTargetPartId(extras: WorkbenchNavigationExtras, layout: ɵWorkbenchLayout): string {
      if (extras.blankPartId && layout.hasPart(extras.blankPartId)) {
        return extras.blankPartId;
      }
      return layout.activePart({grid: 'mainArea'})?.id ?? layout.activePart({grid: 'workbench'}).id;
    }
  }

  /**
   * Experimental API for modifying the workbench layout.
   *
   * @param onNavigate - Callback to modify the current layout.
   *        Receives the current layout and can return a modified layout for navigation. Returning `null` cancels navigation.
   *        The callback can call `inject` to get any required dependencies.
   * @param extras - Controls how to perform the navigation.
   *
   * TODO [WB-LAYOUT] Consider removing relativeTo and state from NavigationExtras as not used (only used in navigateView)
   */
  public ɵnavigate(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.ɵnavigate(onNavigate, extras));
    }

    // Serialize navigation requests to prevent race conditions when modifying the currently active workbench layout.
    return this._singleTaskExecutor.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, this navigation would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout) {
        await this.waitForInitialLayout();
      }

      // Pass control to the navigator to compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      const newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return true;
      }

      const serializedLayout = newLayout.serialize();
      const navigationExtras: NavigationExtras = {
        ...extras,
        // Instruct the Angular router to process the navigation even if the URL does not change, e.g., when changing the workbench grid which is not contained in the URL.
        onSameUrlNavigation: 'reload',
        // Associate workbench-specific state with the navigation.
        state: WorkbenchNavigationalStates.create({
          workbenchGrid: serializedLayout.workbenchGrid,
          maximized: newLayout.maximized,
          viewStates: newLayout.viewStates(),
        }),
      };

      // Create the new URL tree.
      const navigationCommands: {[viewId: ViewId]: Commands | null} = computeNavigationCommands(currentLayout.viewOutlets(), newLayout.viewOutlets());
      const urlTree = this.__createUrlTree(navigationCommands, serializedLayout.mainAreaGrid, navigationExtras);

      // Perform the navigation.
      if (!(await this._router.navigateByUrl(urlTree, navigationExtras))) {
        return false;
      }

      // Block subsequent navigation(s) until Angular has flushed the changed layout to the DOM.
      await firstValueFrom(this._zone.onStable);
      return true;
    });
  }

  /**
   * Experimental API to replace {@link WorkbenchRouter#navigate} for navigating views and modifying the layout.
   *
   * @param onNavigate - Computes the new workbench layout.
   *        Receives the current layout and can return a modified layout for navigation. Returning `null` cancels navigation.
   *        The callback can call `inject` to get any required dependencies.
   * @param extras - Options to control navigation.
   *
   * @internal
   */
  public async createUrlTree(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null, extras?: NavigationExtras): Promise<UrlTree | null> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.createUrlTree(onNavigate, extras));
    }

    return this._singleTaskExecutor.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout) {
        await this.waitForInitialLayout();
      }

      // Pass control to the navigator to compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      const newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return null;
      }

      // Create the new URL tree.
      const navigationCommands: {[outlet: string]: Commands | null} = computeNavigationCommands(currentLayout.viewOutlets(), newLayout.viewOutlets());
      return this.__createUrlTree(navigationCommands, newLayout.serialize().mainAreaGrid, extras);
    });
  }

  /**
   * This method name begins with underscores to indicate that it must only be invoked from within {@link SingleTaskExecutor}.
   */
  private __createUrlTree(outletCommands: {[outlet: string]: Commands | null}, serializedMainAreaGrid: string | null, extras?: NavigationExtras): UrlTree {
    // Add view commands to the 'outlets' fragment to be interpreted by the Angular router.
    const commands: Commands = Object.entries(outletCommands).length ? [{outlets: outletCommands}] : [];

    return this._router.createUrlTree(commands, {
      ...extras,
      queryParams: {...extras?.queryParams, [MAIN_AREA_LAYOUT_QUERY_PARAM]: serializedMainAreaGrid},
      // Merge with existing query params unless specified an explicit strategy, e.g., for migrating an outdated layout URL.
      // Note that `null` is a valid strategy for clearing existing query params, so do not use the nullish coalescing operator (??).
      queryParamsHandling: Defined.orElse(extras?.queryParamsHandling, 'merge'),
      relativeTo: null, // commands are normalized to their absolute form
    });
  }

  /**
   * Returns the context of the current workbench navigation, when being invoked during navigation, or throws an error otherwise.
   *
   * @internal
   */
  public getCurrentNavigationContext(): WorkbenchNavigationContext {
    if (!this._currentNavigationContext) {
      throw Error('[WorkbenchRouterError] Navigation context not available because no navigation is in progress.');
    }
    return this._currentNavigationContext;
  }

  /**
   * Sets navigational contextual data.
   *
   * @internal
   */
  public setCurrentNavigationContext(context: WorkbenchNavigationContext | null): void {
    this._currentNavigationContext = context;
  }

  /**
   * Blocks until the initial layout is available, i.e. after completion of Angular's initial navigation.
   */
  private async waitForInitialLayout(): Promise<void> {
    await firstValueFrom(this._workbenchLayoutService.layout$);
  }

  public ngOnDestroy(): void {
    this._singleTaskExecutor.destroy();
  }
}

/**
 * Represents the extra options used during navigation.
 */
export interface WorkbenchNavigationExtras extends NavigationExtras {
  /**
   * Instructs the router to activate the view. Defaults to `true` if not specified.
   */
  activate?: boolean;
  /**
   * Closes the view(s) that match the specified path. Matrix parameters do not affect view resolution.
   * The path supports the asterisk wildcard segment (`*`) to match view(s) with any value in that segment.
   * To close a specific view, set a view target instead of a path.
   */
  close?: boolean;
  /**
   * Controls where to open the view.
   *
   * One of:
   * - 'auto':    Opens the view in a new view tab if no view is found that matches the specified path. Matrix parameters do not affect
   *              view resolution. If one (or more) view(s) match the specified path, they are navigated instead of opening the view
   *              in a new view tab, e.g., to update matrix parameters. This is the default behavior if not set.
   * - 'blank':   Opens the view in a new view tab.
   * - <view.id>: Navigates the specified view. If already opened, replaces it, or opens the view in a new view tab otherwise.
   *              Note that the passed view identifier must start with `view.`, e.g., `view.5`.
   *
   * If not specified, defaults to `auto`.
   */
  target?: string | 'blank' | 'auto';

  outlet?: string;
  /**
   * Specifies in which part to open the view. By default, if not specified, opens the view in the active part of the main area,
   * if the layout has one, otherwise in the active part of the layout.
   */
  blankPartId?: string;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end';
  /**
   * Associates state with a view navigation.
   *
   * State is written to the browser session history, not to the URL, so will be lost on page reload.
   *
   * State can be read from {@link WorkbenchView.state}, or the browser's session history via `history.state`.
   */
  state?: ViewState;
  /**
   * Specifies CSS class(es) to be added to the view, useful in end-to-end tests for locating view and view tab.
   * CSS class(es) will not be added to the browser URL, consequently will not survive a page reload.
   */
  cssClass?: string | string[];
}

/**
 * Contextual data of a workbench navigation available on the router during navigation.
 *
 * @internal
 * @see WorkbenchUrlObserver
 */
export interface WorkbenchNavigationContext {
  /**
   * Layout to be applied after successful navigation.
   */
  layout: ɵWorkbenchLayout;
  /**
   * Workbench layout elements added or removed by the current navigation.
   */
  layoutDiff: WorkbenchLayoutDiff;
  /**
   * Popups added or removed by the current navigation.
   */
  popupDiff: WorkbenchPopupDiff;
}

/**
 * Creates commands to be passed to the Angular router to navigate the view outlets of the new layout and to remove
 * the view outlets of removed views.
 */
function computeNavigationCommands(previousViewOutlets: ViewOutlets, nextViewOutlets: ViewOutlets): {[outlet: ViewId]: Commands | null} {
  const previousViewOutletMap = new Map<ViewId, UrlSegment[]>(Objects.entries(previousViewOutlets));
  const nextViewOutletMap = new Map<ViewId, UrlSegment[]>(Objects.entries(nextViewOutlets));

  const commands = new Map<ViewId, Commands | null>();
  const viewIds = new Set<ViewId>([...previousViewOutletMap.keys(), ...nextViewOutletMap.keys()]);

  viewIds.forEach(viewId => {
    // Test if the view was added to the layout.
    if (!previousViewOutletMap.has(viewId)) {
      commands.set(viewId, RouterUtils.segmentsToCommands(nextViewOutletMap.get(viewId)!));
    }
    // Test if the view was removed from the layout.
    else if (!nextViewOutletMap.has(viewId)) {
      commands.set(viewId, null);
    }
    // Test if the view was updated.
    else if (!new UrlSegmentMatcher(previousViewOutletMap.get(viewId)!, {matchMatrixParams: true, matchWildcardPathSegment: false}).matches(nextViewOutletMap.get(viewId)!)) {
      commands.set(viewId, RouterUtils.segmentsToCommands(nextViewOutletMap.get(viewId)!));
    }
  });

  return Object.fromEntries(commands);
}
