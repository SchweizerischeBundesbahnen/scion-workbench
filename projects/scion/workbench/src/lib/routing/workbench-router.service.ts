/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ActivatedRoute, NavigationExtras, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from '@angular/router';
import { WorkbenchViewRegistry } from '../view/workbench-view.registry';
import { Arrays, Defined } from '@scion/toolkit/util';
import { Injectable } from '@angular/core';
import { WorkbenchLayoutService } from '../layout/workbench-layout.service';
import { ACTIVITY_OUTLET_NAME, PARTS_LAYOUT_QUERY_PARAM, VIEW_REF_PREFIX, VIEW_TARGET } from '../workbench.constants';
import { PartsLayout } from '../layout/parts-layout';
import { filter, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { WorkbenchLayoutDiff } from './workbench-layout-differ';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
@Injectable()
export class WorkbenchRouter {

  private _currentNavigationContext$ = new BehaviorSubject<WorkbenchNavigationContext | null>(null);

  constructor(private _router: Router,
              private _viewRegistry: WorkbenchViewRegistry,
              private _layoutService: WorkbenchLayoutService) {
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
  public async navigate(commandList: Commands, extras: WbNavigationExtras = {}): Promise<boolean> {
    const commands = this.normalizeCommands(commandList, extras.relativeTo);

    if (extras.closeIfPresent) {
      return this.closeViews(...this.resolvePresentViewIds(commands));
    }

    const activateIfPresent = Defined.orElse(extras.activateIfPresent, !commands.includes('new') && !commands.includes('create') /* coerce activation based on command segment names */);
    // If the view is present, activate it.
    if (activateIfPresent) {
      const presentViewId = this.resolvePresentViewIds(commands)[0];
      if (presentViewId) {
        return this.ɵnavigate(layout => layout.activateView(presentViewId));
      }
    }

    switch (extras.target || (extras.selfViewId ? 'self' : 'blank')) {
      case 'blank': {
        const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
        const viewTarget: { [outlet: string]: ViewTarget } = {
          [newViewId]: {
            partId: extras.blankPartId,
            viewIndex: extras.blankInsertionIndex,
          },
        };
        const navigationExtras: NavigationExtras = {
          ...extras,
          state: {
            ...extras.state,
            [VIEW_TARGET]: viewTarget,
          },
        };

        return this.ɵnavigate(layout => ({layout, viewOutlets: {[newViewId]: commands}}), navigationExtras); // The view is added in {WbAddViewToPartGuard} to the layout in order to resolve its part
      }
      case 'self': {
        if (!extras.selfViewId) {
          throw Error('[WorkbenchRouterError] Missing required navigation property \'selfViewId\'.');
        }

        const urlTree = this._router.parseUrl(this._router.url);
        const urlSegmentGroups = urlTree.root.children;
        if (!urlSegmentGroups[extras.selfViewId]) {
          throw Error(`[WorkbenchRouterError] Target view outlet not found: ${extras.selfViewId}'`);
        }

        return this.ɵnavigate(layout => ({layout, viewOutlets: {[extras.selfViewId!]: commands}}), extras);
      }
      default: {
        throw Error(`[WorkbenchRouterError] Invalid routing target. Expected 'self' or 'blank', but received ${extras.target}'.`);
      }
    }
  }

  /**
   * Experimental API to replace {@link WorkbenchRouter#navigate} for navigating views and modifying the layout.
   * @internal
   */
  public async ɵnavigate(computeNavigationFn: (layout: PartsLayout) => PartsLayout | WorkbenchNavigation, extras?: NavigationExtras): Promise<boolean> {
    const urlTree = await this.createUrlTree(computeNavigationFn, extras);
    return this._router.navigateByUrl(urlTree, extras);
  }

  /**
   * Experimental API to replace {@link WorkbenchRouter#navigate} for navigating views and modifying the layout.
   * @internal
   */
  public async createUrlTree(computeNavigationFn: (layout: PartsLayout) => PartsLayout | WorkbenchNavigation, extras?: NavigationExtras): Promise<UrlTree> {
    // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
    // Otherwise, would override the initial layout as given in the URL.
    await this.waitForInitialLayout();

    // Do not interfere with a potentially running navigation. For example, if observing the view registry,
    // you would get events during navigation. If you would then start an extra navigation, e.g., when the
    // view count drops to zero, this could end up in an invalid routing state.
    await this.waitForNavigationToComplete();

    // Let the caller modify the layout.
    const result = computeNavigationFn(this._layoutService.layout!);

    // Coerce the result to a {WorkbenchNavigation} object.
    const navigation: WorkbenchNavigation = result instanceof PartsLayout ? ({layout: result}) : result;

    // Normalize commands of the outlets to their absolute form and resolve relative navigational symbols.
    const viewOutlets = this.normalizeOutletCommands(navigation.viewOutlets);

    // Add view outlets as 'outlets' fragment to be interpreted by Angular.
    const commands: Commands = viewOutlets ? [{outlets: viewOutlets}] : [];

    // Let Angular Router construct the URL tree.
    return this._router.createUrlTree(commands, {
      ...extras,
      queryParams: {...extras?.queryParams, [PARTS_LAYOUT_QUERY_PARAM]: navigation.layout.serialize()},
      queryParamsHandling: 'merge',
      relativeTo: null, // commands are normalized to their absolute form
    });
  }

  /**
   * @see normalizeCommands
   */
  private normalizeOutletCommands(outlets?: { [outlet: string]: Commands | null }, relativeTo?: ActivatedRoute | null): { [outlet: string]: Commands | null } | null {
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
  public resolvePresentViewIds(commands: Commands): string[] {
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
    const context = this._currentNavigationContext$.value;
    if (!context) {
      throw Error('[WorkbenchRouterError] Navigation context not available as no navigation is in progress.');
    }
    return context;
  }

  /**
   * Sets navigational contextual data.
   *
   * @internal
   */
  public setCurrentNavigationContext(context: WorkbenchNavigationContext | null): void {
    this._currentNavigationContext$.next(context);
  }

  /**
   * Waits for a potentially running navigations to complete. Resolves immediately if there is no navigation in progress.
   */
  private async waitForNavigationToComplete(): Promise<void> {
    await this._currentNavigationContext$
      .pipe(
        filter(() => !this.hasCurrentNavigation()),
        take(1),
      )
      .toPromise();
  }

  /**
   * Blocks until the initial layout is available, i.e. after completion of Angular's initial navigation.
   */
  private async waitForInitialLayout(): Promise<void> {
    await this._layoutService.layout$
      .pipe(take(1))
      .toPromise();
  }

  /**
   * Tests if there is a current navigation in progress.
   */
  private hasCurrentNavigation(): boolean {
    return this._currentNavigationContext$.value !== null;
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
    // Use a separate navigate command to remove each view separately. Otherwise, if a view would reject destruction,
    // no view would be removed at all.
    return viewIds.reduce((prevNavigation, viewId) => {
      const closeViewFn = () => this.ɵnavigate(layout => ({
        layout: layout.removeView(viewId),
        viewOutlets: {[viewId]: null},
      }));
      return prevNavigation.then(() => closeViewFn());
    }, Promise.resolve(true));
  }
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
  viewOutlets?: { [outlet: string]: Commands | null };
}
