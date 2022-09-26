/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRoute, NavigationExtras, PRIMARY_OUTLET, Router, UrlSegment, UrlTree} from '@angular/router';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {Arrays, Defined, Dictionaries, Dictionary} from '@scion/toolkit/util';
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ACTIVITY_OUTLET_NAME, PARTS_LAYOUT_QUERY_PARAM, VIEW_REF_PREFIX, VIEW_TARGET} from '../workbench.constants';
import {PartsLayout} from '../layout/parts-layout';
import {WorkbenchLayoutDiff} from './workbench-layout-differ';
import {SingleTaskExecutor} from '../executor/single-task-executor';
import {firstValueFrom} from 'rxjs';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
@Injectable()
export class WorkbenchRouter implements OnDestroy {

  private _singleTaskExecutor = new SingleTaskExecutor();

  /**
   * Holds the current navigational context during a workbench navigation, or `null` if no navigation is in progress.
   */
  private _currentNavigationContext: WorkbenchNavigationContext | null = null;

  /**
   * Holds the current navigation state during a workbench navigation.
   *
   * Actually, passed state can be looked up via the Angular router while performing a navigation. But, the Angular router discards passed state if a
   * guard performs a redirect. For that reason, we need to hold the state here as well. See Angular issue https://github.com/angular/angular/issues/27148.
   */
  private _currentNavigationViewState = new Map<string, Dictionary | undefined>();

  constructor(private _router: Router,
              private _viewRegistry: WorkbenchViewRegistry,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _zone: NgZone) {
  }

  /**
   * Navigates based on the provided array of commands, and is like 'Router.navigate(...)' but with a workbench view as the router outlet target.
   *
   * By default, navigation is absolute. Make it relative by providing a `relativeTo` route in navigational extras.
   * Navigation allows to close present views matching the routing commands if `closeIfPresent` is set in navigational extras.
   *
   * - Target view can be set via {WbNavigationExtras} object.
   * - Multiple static segments can be merged into one, e.g. `['/team/11/user', userName, {details: true}]`
   * - The first segment name can be prepended with `/`, `./`, or `../`
   * - Matrix parameters can be used to associate optional data with the URL, e.g. `['user', userName, {details: true}]`
   *   Matrix parameters are like regular URL parameters, but do not affect route resolution. Unlike query parameters, matrix parameters
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
   * @see WbRouterLinkDirective
   */
  public navigate(commands: Commands, extras: WbNavigationExtras = {}): Promise<boolean> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.navigate(commands, extras));
    }

    if (extras.closeIfPresent) {
      return this.closeViews(...this.resolvePresentViewIds(commands, extras.relativeTo));
    }

    return this.ɵnavigate((layout: PartsLayout): WorkbenchNavigation | PartsLayout => {
      const activateIfPresent = Defined.orElse(extras.activateIfPresent, !commands.includes('new') && !commands.includes('create') /* coerce activation based on command segment names */);
      // If the view is present, activate it.
      if (activateIfPresent) {
        const presentViewId = this.resolvePresentViewIds(commands, extras.relativeTo)[0];
        if (presentViewId) {
          return layout.activateView(presentViewId);
        }
      }

      // Add CSS classes to navigational state in order to be added to view and view tab when activating the route.
      extras.state = {
        ...extras.state,
        ...(extras.cssClass ? {[WorkbenchNavigationalStates.cssClass]: extras.cssClass} : null),
      };

      switch (extras.target || (extras.selfViewId ? 'self' : 'blank')) {
        case 'blank': {
          const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
          const viewTarget: ViewTarget = Dictionaries.withoutUndefinedEntries({
            partId: extras.blankPartId,
            viewIndex: extras.blankInsertionIndex,
          });

          return {
            layout, // The view is added in {WbAddViewToPartGuard} to the layout in order to resolve its part
            viewOutlets: {[newViewId]: commands},
            viewState: {[newViewId]: {...extras.state, ...Object.keys(viewTarget).length ? {[VIEW_TARGET]: viewTarget} : {}}},
          };
        }
        case 'self': {
          if (!extras.selfViewId) {
            throw Error('[WorkbenchRouterError] Missing required navigation property \'selfViewId\'.');
          }

          const urlTree = this._router.parseUrl(this._router.url);
          const urlSegmentGroups = urlTree.root.children;
          if (!urlSegmentGroups[extras.selfViewId]) {
            throw Error(`[WorkbenchRouterError] Target view outlet not found: ${extras.selfViewId}.`);
          }

          return ({
            layout,
            viewOutlets: {[extras.selfViewId!]: commands},
            viewState: {[extras.selfViewId!]: extras.state},
          });
        }
        default: {
          throw Error(`[WorkbenchRouterError] Invalid routing target. Expected 'self' or 'blank', but received ${extras.target}'.`);
        }
      }
    }, extras);
  }

  /**
   * Experimental API to replace {@link WorkbenchRouter#navigate} for navigating views and modifying the layout.
   *
   * @param onNavigate - Computes the new workbench layout.
   *        The callback is passed the current workbench layout which the caller can modify and return.
   *        In the callback, it is safe to access currently activated routes or the current router url.
   * @param extras - Modifies the navigation strategy.
   * @internal
   */
  public ɵnavigate(onNavigate: (layout: PartsLayout) => PartsLayout | WorkbenchNavigation | null, extras?: NavigationExtras): Promise<boolean> {
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
      const navigation: WorkbenchNavigation | null = coerceNavigation(await onNavigate(this._workbenchLayoutService.layout!));
      if (!navigation) {
        return false;
      }

      // Compute the new URL tree.
      const urlTree = this.createUrlTreeUnsafe(navigation, extras);

      // Ensure a view state object for each changed outlet, so that {@link NavigationStateResolver} will ignore the state of the previously activated route.
      const viewState = Object.keys(navigation.viewOutlets || {}).reduce((acc, outlet) => {
        acc[outlet] = acc[outlet] || {}; // empty state
        return acc;
      }, navigation.viewState || {});

      // Perform the navigation.
      Object.entries(viewState).forEach(([outletName, state]) => this._currentNavigationViewState.set(outletName, state));
      try {
        return await this._router.navigateByUrl(urlTree, extras);
      }
      finally {
        Object.keys(viewState).forEach(outletName => this._currentNavigationViewState.delete(outletName));
      }
    });
  }

  /**
   * Experimental API to replace {@link WorkbenchRouter#navigate} for navigating views and modifying the layout.
   *
   * @param onNavigate - Computes the new workbench layout.
   *        The callback is passed the current workbench layout which the caller can modify and return.
   *        In the callback, it is safe to access currently activated routes or the current router url.
   * @param extras - Options to control navigation.
   * @internal
   */
  public async createUrlTree(onNavigate: (layout: PartsLayout) => Promise<PartsLayout | WorkbenchNavigation> | PartsLayout | WorkbenchNavigation, extras?: NavigationExtras): Promise<UrlTree> {
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
      const navigation: WorkbenchNavigation = coerceNavigation(await onNavigate(this._workbenchLayoutService.layout!))!;

      // create the URL tree.
      return this.createUrlTreeUnsafe(navigation, extras);
    });
  }

  /**
   * This method is suffixed 'UNSAFE' because it should only be invoked via a {@link SingleTaskExecutor}.
   */
  private createUrlTreeUnsafe(workbenchNavigation: WorkbenchNavigation, extras?: NavigationExtras): UrlTree {
    // Normalize commands of the outlets to their absolute form and resolve relative navigational symbols.
    const viewOutlets = this.normalizeOutletCommands(workbenchNavigation.viewOutlets, extras?.relativeTo);

    // Add view outlets as 'outlets' fragment to be interpreted by Angular.
    const commands: Commands = viewOutlets ? [{outlets: viewOutlets}] : [];

    // Let Angular Router construct the URL tree.
    return this._router.createUrlTree(commands, {
      ...extras,
      queryParams: {...extras?.queryParams, [PARTS_LAYOUT_QUERY_PARAM]: workbenchNavigation.layout.serialize()},
      queryParamsHandling: 'merge',
      relativeTo: null, // commands are normalized to their absolute form
    });
  }

  /**
   * @see normalizeCommands
   */
  private normalizeOutletCommands(outlets?: {[outlet: string]: Commands | null}, relativeTo?: ActivatedRoute | null): {[outlet: string]: Commands | null} | null {
    if (!outlets || !Object.keys(outlets).length) {
      return null;
    }

    return Object.entries(outlets).reduce((acc, [outletName, commands]) => {
      return {
        ...acc,
        [outletName]: commands ? this.normalizeCommands(commands, relativeTo) : null, // `null` to remove an outlet
      };
    }, {});
  }

  /**
   * Normalizes commands to their absolute form.
   *
   * ---
   * As of Angular 6.x, commands which target a named outlet (auxiliary route) are not normalized, meaning that
   * relative navigational symbols like `/`, `./`, or `../` are not resolved (see `create_url_tree.ts` method: `computeNavigation`).
   *
   * Example: router.navigate([{outlets: {[outlet]: commands}}])
   *
   * To bypass that restriction, we first create an URL tree without specifying the target outlet. As expected, this translates into an
   * URL with all navigational symbols resolved. Then, we extract the URL segments of the resolved route and convert it back into commands.
   * The resulting commands are in their absolute form and may be used for the effective navigation to target a named router outlet.
   *
   * @internal
   */
  public normalizeCommands(commands: Commands, relativeTo?: ActivatedRoute | null): Commands {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.normalizeCommands(commands, relativeTo));
    }

    const normalizeFn = (outlet: string, extras?: NavigationExtras): Commands => {
      return this._router.createUrlTree(commands, extras)
        .root.children[outlet].segments
        .reduce<Commands>((acc, p) => [...acc, p.path, ...(Object.keys(p.parameters).length ? [p.parameters] : [])], []);
    };

    if (!relativeTo) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    const targetOutlet = relativeTo.pathFromRoot[1]?.outlet;
    if (!targetOutlet || (!targetOutlet.startsWith(VIEW_REF_PREFIX) && !targetOutlet.startsWith(ACTIVITY_OUTLET_NAME))) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    return normalizeFn(targetOutlet, {relativeTo});
  }

  /**
   * Resolves present views which match the given commands.
   *
   * @internal
   */
  public resolvePresentViewIds(commandList: Commands, relativeTo?: ActivatedRoute | null): string[] {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.resolvePresentViewIds(commandList, relativeTo));
    }

    const commands = this.normalizeCommands(commandList, relativeTo);
    const serializeCommands = this.serializeCommands(commands);
    const urlTree = this._router.parseUrl(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    return Object.keys(urlSegmentGroups)
      .filter(outletName => outletName.startsWith(VIEW_REF_PREFIX))
      .filter(outletName => Arrays.isEqual(serializeCommands, urlSegmentGroups[outletName].segments.map((segment: UrlSegment) => segment.toString())));
  }

  /**
   * Returns the context of the current workbench navigation, when being invoked during navigation, or throws an error otherwise.
   *
   * @internal
   */
  public getCurrentNavigationContext(): WorkbenchNavigationContext {
    if (!this._currentNavigationContext) {
      throw Error('[WorkbenchRouterError] Navigation context not available as no navigation is in progress.');
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
   * Returns state passed to the navigation via {NavigationExtras.state}.
   *
   * @internal
   */
  public getCurrentNavigationViewState(outletName: string): Dictionary | undefined {
    return this._currentNavigationViewState.get(outletName);
  }

  /**
   * Blocks until the initial layout is available, i.e. after completion of Angular's initial navigation.
   */
  private async waitForInitialLayout(): Promise<void> {
    await firstValueFrom(this._workbenchLayoutService.layout$);
  }

  /**
   * Serializes given commands into valid URL segments.
   */
  private serializeCommands(commands: Commands): string[] {
    const serializedCommands: string[] = [];

    commands.forEach(cmd => {
      // if matrix param, append it to the last segment
      if (typeof cmd === 'object') {
        serializedCommands.push(new UrlSegment(serializedCommands.pop()!, cmd).toString());
      }
      else {
        serializedCommands.push(encodeURIComponent(cmd));
      }
    });

    return serializedCommands;
  }

  /**
   * Instructs the routing to close given views.
   *
   * @internal
   */
  public closeViews(...viewIds: string[]): Promise<boolean> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.closeViews(...viewIds));
    }

    // Use a separate navigate command to remove each view separately. Otherwise, if a view would reject destruction,
    // no view would be removed at all.
    return viewIds.reduce((prevNavigation, viewId) => {
      const closeViewFn = (): Promise<boolean> => this.ɵnavigate(layout => ({
        layout: layout.removeView(viewId),
        viewOutlets: {[viewId]: null},
      }));
      return prevNavigation.then(() => closeViewFn());
    }, Promise.resolve(true));
  }

  public ngOnDestroy(): void {
    this._singleTaskExecutor.destroy();
  }
}

function coerceNavigation(navigation: PartsLayout | WorkbenchNavigation | null): WorkbenchNavigation | null {
  return navigation instanceof PartsLayout ? ({layout: navigation}) : navigation;
}

/**
 * Represents the extra options used during navigation.
 */
export interface WbNavigationExtras extends NavigationExtras {
  /**
   * Activates the view if it is already present.
   * If not present, the view is opened according to the specified 'target' strategy.
   */
  activateIfPresent?: boolean;
  /**
   * Closes the view(s) that match the array of commands, if any.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * 'blank': opens the view in a new view tab (which is by default)
   * 'self':  opens the view in the current view tab
   */
  target?: 'blank' | 'self';
  /**
   * Specifies the view which to replace when using 'self' view target strategy.
   * If not specified and if in the context of a workbench view, that view is used as the self target.
   */
  selfViewId?: string;
  /**
   * Specifies the viewpart where to add the view when using 'blank' view target strategy.
   * If not specified, the currently active workbench viewpart is used.
   */
  blankPartId?: string;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end';
  /**
   * State that will be passed to the navigation.
   *
   * See {@link NavigationExtras#state} for detailed instructions on how to access passed state during and after the navigation.
   *
   * In addition, the workbench router makes state available to the routed component as resolved data under the key {@link WorkbenchRouteData.state}
   * and state is not discarded if guards perform a redirect.
   */
  state?: Dictionary;
  /**
   * Associates CSS class(es) with a view, useful in end-to-end tests for locating views and view tabs.
   * CSS class(es) will not be added to the browser URL, consequently will not survive a page reload.
   */
  cssClass?: string | string[];
}

/**
 * Specifies the target of a view in the layout tree.
 *
 * @internal
 * @see WbAddViewToPartGuard
 */
export interface ViewTarget {
  /**
   * Specifies the part where to add a view. If not set, adds it to its preferred part, if defined on its route, or to the currently active part.
   */
  partId?: string;
  /**
   * Specifies the position where to add the view tab into the tabbar.
   */
  viewIndex?: number | 'start' | 'end';
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
  partsLayout: PartsLayout;
  /**
   * Changes in the workbench layout to be applied by the current navigation.
   */
  layoutDiff: WorkbenchLayoutDiff;
}

/**
 * An array of URL fragments with which to construct a view's URL.
 *
 * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path segments,
 * followed by the parameters for each segment.
 *
 * The last segment allows adding matrix parameters in the form of a dictionary to provide additional data along
 * with the URL. Matrix parameters do not affect route resolution. In the routed component, matrix parameters are
 * available in {@link ActivatedRoute#params}.
 *
 * Example command array with 'details' as matrix parameter: `['user', userName, {details: true}]`,
 */
export type Commands = any[];

/**
 * Information about a workbench navigation operation.
 *
 * @internal
 */
export interface WorkbenchNavigation {
  /**
   * The target layout to apply.
   */
  layout: PartsLayout;
  /**
   * View outlet delta to apply to the current URL. For each outlet to add, remove, or change,
   * add a property to this dictionary and set the commands to construct the outlet URL.
   * To remove an outlet from the URL, set its commands to `null`.
   */
  viewOutlets?: {[outlet: string]: Commands | null};
  /**
   * State to be passed to the routed component as resolved data under the key {@link WorkbenchRouteData.state}.
   */
  viewState?: {[outlet: string]: Dictionary | undefined};
}
