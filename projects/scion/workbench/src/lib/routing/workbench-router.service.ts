/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRoute, NavigationExtras, PRIMARY_OUTLET, Router, UrlSegment, UrlTree} from '@angular/router';
import {Defined, Dictionary} from '@scion/toolkit/util';
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM} from '../workbench.constants';
import {WorkbenchLayoutDiff} from './workbench-layout-differ';
import {WorkbenchPopupDiff} from './workbench-popup-differ';
import {SingleTaskExecutor} from '../executor/single-task-executor';
import {firstValueFrom} from 'rxjs';
import {WorkbenchNavigationalStates, WorkbenchNavigationalViewStates} from './workbench-navigational-states';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';

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
              private _viewRegistry: WorkbenchViewRegistry,
              private _workbenchLayoutService: WorkbenchLayoutService,
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
      return this.ɵnavigate((layout: ɵWorkbenchLayout): WorkbenchNavigation | ɵWorkbenchLayout | null => {
        if (extras.target) {
          const viewId = extras.target;
          if (commands.length) {
            throw Error(`[WorkbenchRouterError][IllegalArgumentError] The commands must be empty if closing a view by viewId [commands=${commands}]`);
          }
          if (!layout.views().some(view => view.id === viewId)) {
            return null;
          }
          return removeView(viewId, layout);
        }
        const viewIds = this.resolvePresentViewIds(commands, {relativeTo: extras.relativeTo, matchWildcardSegments: true});
        return viewIds.reduce((navigation, viewId) => removeView(viewId, navigation), {layout});
      });
    }

    return this.ɵnavigate((layout: ɵWorkbenchLayout): WorkbenchNavigation | ɵWorkbenchLayout | null => {
      switch (extras.target ?? 'auto') {
        case 'blank': {
          return addView(layout.computeNextViewId(), layout);
        }
        case 'auto': {
          const viewIds = this.resolvePresentViewIds(commands, {relativeTo: extras.relativeTo});
          if (viewIds.length) {
            return viewIds.reduce((navigation, viewId) => updateView(viewId, navigation), {layout});
          }
          else {
            return addView(layout.computeNextViewId(), layout);
          }
        }
        default: {
          const viewId = extras.target!;
          if (layout.views().some(view => view.id === viewId)) {
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
    function addView(viewId: string, layout: ɵWorkbenchLayout): WorkbenchNavigation {
      const partId = ((): string => {
        if (extras.blankPartId && layout.hasPart(extras.blankPartId)) {
          return extras.blankPartId;
        }
        return layout.activePart({grid: 'mainArea'})?.id ?? layout.activePart({grid: 'workbench'}).id;
      })();

      return {
        layout: layout.addView(viewId, {
          partId,
          position: extras.blankInsertionIndex ?? 'after-active-view',
          activateView: extras.activate ?? true,
        }),
        viewOutlets: commands.length ? {[viewId]: commands} : {},
        viewStates: {[viewId]: {[WorkbenchNavigationalViewStates.cssClass]: extras.cssClass}},
      };
    }

    /**
     * Creates the navigation for updating the path of the specified view.
     */
    function updateView(viewId: string, layout: WorkbenchNavigation | ɵWorkbenchLayout): WorkbenchNavigation {
      const navigation = coerceNavigation(layout)!;
      const activateView = extras.activate ?? true;
      return {
        layout: activateView ? navigation.layout.activateView(viewId) : navigation.layout,
        viewOutlets: {...navigation.viewOutlets, ...(commands.length ? {[viewId]: commands} : {})},
        viewStates: {...navigation.viewStates, [viewId]: {[WorkbenchNavigationalViewStates.cssClass]: extras.cssClass}},
      };
    }

    /**
     * Creates the navigation for removing the specified view from the workbench layout.
     */
    function removeView(viewId: string, layout: WorkbenchNavigation | ɵWorkbenchLayout): WorkbenchNavigation {
      const navigation = coerceNavigation(layout)!;
      return {
        layout: navigation.layout.removeView(viewId),
        viewOutlets: {...navigation.viewOutlets, [viewId]: null},
        viewStates: navigation.viewStates,
      };
    }
  }

  /**
   * Experimental API for modifying the workbench layout.
   *
   * @param onNavigate - Callback to modify the current layout.
   *        The callback is passed the current layout which can be modified and returned for navigation. Returning `null` does not perform the navigation.
   * @param extras - Controls how to perform the navigation.
   */
  public ɵnavigate(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | WorkbenchNavigation | null> | ɵWorkbenchLayout | WorkbenchNavigation | null, extras?: NavigationExtras): Promise<boolean> {
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
        return true;
      }

      // Add user-defined state from navigation extras to the view state.
      // NOTE: We must ensure that a view state object is associated for each outlet to be navigated.
      // Otherwise, if the state object were `null` or `undefined`, {@link NavigationStateResolver} would restore the state of the previously activated route.
      const viewStates = Object.keys(navigation.viewOutlets || {}).reduce((viewStates, viewId) => {
        viewStates[viewId] = {...viewStates[viewId], ...extras?.state};
        return viewStates;
      }, navigation.viewStates || {});

      // Instruct the router to process the navigation even if the URL does not change, e.g., when changing the workbench grid which is not contained in the URL.
      extras = {...extras, onSameUrlNavigation: 'reload'};

      // Serialize the layout.
      const serializedLayout = navigation.layout.serialize();

      // Associate workbench-specific state with the navigation.
      WorkbenchNavigationalStates.addToNavigationExtras(extras, {
        workbenchGrid: serializedLayout.workbenchGrid,
        maximized: navigation.layout.maximized,
        viewStates,
      });

      // Compute the new URL tree.
      const urlTree = this.__createUrlTree(navigation.viewOutlets, serializedLayout.mainAreaGrid, extras);

      // Perform the navigation.
      if (!(await this._router.navigateByUrl(urlTree, extras))) {
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
   *        The callback is passed the current workbench layout which the caller can modify and return.
   *        In the callback, it is safe to access currently activated routes or the current router url.
   * @param extras - Options to control navigation.
   *
   * @internal
   */
  public async createUrlTree(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | WorkbenchNavigation> | ɵWorkbenchLayout | WorkbenchNavigation, extras?: NavigationExtras): Promise<UrlTree> {
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
      return this.__createUrlTree(navigation.viewOutlets, navigation.layout.serialize().mainAreaGrid, extras);
    });
  }

  /**
   * This method name begins with underscores to indicate that it must only be invoked from within {@link SingleTaskExecutor}.
   */
  private __createUrlTree(viewOutlets: {[outlet: string]: Commands | null} | undefined, serializedMainAreaGrid: string | null, extras?: NavigationExtras): UrlTree {
    // Normalize commands of the outlets to their absolute form and resolve relative navigational symbols.
    const normalizedViewOutlets = this.normalizeOutletCommands(viewOutlets, extras?.relativeTo);

    // Add view outlets as 'outlets' fragment to be interpreted by Angular.
    const commands: Commands = normalizedViewOutlets ? [{outlets: normalizedViewOutlets}] : [];

    // Let Angular Router construct the URL tree.
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
   * To bypass that restriction, we first create a URL tree without specifying the target outlet. As expected, this translates into a
   * URL with all navigational symbols resolved. Then, we extract the URL segments of the resolved route and convert it back into commands.
   * The resulting commands are in their absolute form and may be used for the effective navigation to target a named router outlet.
   */
  private normalizeCommands(commands: Commands, relativeTo?: ActivatedRoute | null): Commands {
    if (!commands.length) {
      return [];
    }

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
    if (!targetOutlet) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    return normalizeFn(targetOutlet, {relativeTo});
  }

  /**
   * Resolves present views which match the given commands.
   *
   * Allows matching wildcard segments by setting the option `matchWildcardSegments` to `true`.
   *
   * @internal
   */
  public resolvePresentViewIds(commandList: Commands, options?: {relativeTo?: ActivatedRoute | null; matchWildcardSegments?: boolean}): string[] {
    const commands = this.normalizeCommands(commandList, options?.relativeTo);
    const commandPath = this.serializeCommands(commands, {skipMatrixParams: true});
    const matchWildcardSegments = options?.matchWildcardSegments ?? false;

    return this._viewRegistry.views
      .filter(view => {
        const viewPath = view.urlSegments.map(segment => segment.path);
        if (commandPath.length !== viewPath.length) {
          return false;
        }
        return commandPath.every((commandSegment, index) => (matchWildcardSegments && commandSegment === '*') || commandSegment === viewPath[index]);
      })
      .map(view => view.id);
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
   * Blocks until the initial layout is available, i.e. after completion of Angular's initial navigation.
   */
  private async waitForInitialLayout(): Promise<void> {
    await firstValueFrom(this._workbenchLayoutService.layout$);
  }

  /**
   * Serializes given commands into valid URL segments.
   */
  private serializeCommands(commands: Commands, options?: {skipMatrixParams?: boolean}): string[] {
    const serializedCommands: string[] = [];
    const skipMatrixParams = options?.skipMatrixParams ?? false;
    commands.forEach(cmd => {
      // if matrix param, append it to the last segment
      const isMatrixParam = typeof cmd === 'object';

      if (!isMatrixParam) {
        serializedCommands.push(encodeURIComponent(cmd));
      }
      else if (!skipMatrixParams) {
        serializedCommands.push(new UrlSegment(serializedCommands.pop()!, cmd).toString());
      }
    });

    return serializedCommands;
  }

  public ngOnDestroy(): void {
    this._singleTaskExecutor.destroy();
  }
}

function coerceNavigation(navigation: ɵWorkbenchLayout | WorkbenchNavigation | null): WorkbenchNavigation | null {
  return navigation instanceof ɵWorkbenchLayout ? ({layout: navigation}) : navigation;
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
   * State that will be passed to the navigation.
   *
   * See {@link NavigationExtras#state} for detailed instructions on how to access passed state during and after the navigation.
   *
   * In addition, the workbench router makes state available to the routed component as resolved data under the key {@link WorkbenchRouteData.state}.
   */
  state?: Dictionary;
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
 */
export interface WorkbenchNavigation {
  /**
   * The target layout to apply.
   */
  layout: ɵWorkbenchLayout;
  /**
   * View outlet delta to apply to the current URL. For each outlet to add, remove, or change,
   * add a property to this dictionary and set the commands to construct the outlet URL.
   * To remove an outlet from the URL, set its commands to `null`.
   */
  viewOutlets?: {[outlet: string]: Commands | null};
  /**
   * State to be passed to the routed component as resolved data under the key {@link WorkbenchRouteData.state}.
   */
  viewStates?: {[outlet: string]: Dictionary};
}
