/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { ACTIVITY_OUTLET_NAME, VIEW_GRID_QUERY_PARAM, VIEW_REF_PREFIX } from '../workbench.constants';
import { ActivatedRoute, NavigationExtras, PRIMARY_OUTLET, Router, UrlSegment } from '@angular/router';
import { InternalWorkbenchService } from '../workbench.service';
import { ViewPartGridUrlObserver } from '../view-part-grid/view-part-grid-url-observer.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { Defined } from '../defined.util';
import { WorkbenchView } from '../workbench.model';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
export abstract class WorkbenchRouter {

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
  public abstract navigate(commands: any[], extras?: WbNavigationExtras): Promise<boolean>;

  /**
   * Resolves present views which match the given URL path.
   *
   * @deprecated to destroy views, use `Router.navigate` and set `closeIfPresent` in `WbNavigationExtras`; will be removed in the next release
   */
  public abstract resolve(commands: any[]): WorkbenchView[];
}

@Injectable()
export class InternalWorkbenchRouter implements WorkbenchRouter {

  constructor(private _router: Router,
              private _workbench: InternalWorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartGridUrlObserver: ViewPartGridUrlObserver) {
  }

  public navigate(commandList: any[], extras: WbNavigationExtras = {}): Promise<boolean> {
    const commands = this.normalizeCommands(commandList, extras.relativeTo);

    if (extras.closeIfPresent) {
      return this._workbench.destroyView(...this.resolvePresentViewRefs(commands));
    }

    const activateIfPresent = Defined.orElse(extras.activateIfPresent, extras.tryActivateView); // tslint:disable-line:deprecation
    const coerceActivate = activateIfPresent === undefined && !commands.includes('new') && !commands.includes('create');

    // If view is present, activate it.
    if (activateIfPresent || coerceActivate) {
      const presentViewRef = this.resolvePresentViewRefs(commands)[0];
      if (presentViewRef) {
        return this._workbench.activateView(presentViewRef);
      }
    }

    const routeFn = (outlet: string, serializedGrid: string): Promise<boolean> => {
      return this._router.navigate([{outlets: {[outlet]: commands}}], {
        ...extras as NavigationExtras,
        relativeTo: null, // commands are absolute because normalized
        queryParams: {...extras.queryParams, [VIEW_GRID_QUERY_PARAM]: serializedGrid},
        queryParamsHandling: 'merge'
      });
    };

    switch (extras.target || 'blank') {
      case 'blank': {
        const newViewRef = this._viewRegistry.computeNextViewOutletIdentity();
        const viewPartRef = extras.blankViewPartRef || this._workbench.activeViewPartService.viewPartRef;
        const grid = this._viewPartGridUrlObserver.snapshot.addView(viewPartRef, newViewRef).serialize();
        return routeFn(newViewRef, grid);
      }
      case 'self': {
        if (!extras.selfViewRef) {
          throw Error('Invalid argument: navigation property \'selfViewRef\' required for routing view target \'self\'.');
        }

        const urlTree = this._router.parseUrl(this._router.url);
        const urlSegmentGroups = urlTree.root.children;
        if (!urlSegmentGroups[extras.selfViewRef]) {
          throw Error(`Invalid argument: '${extras.selfViewRef}' is not a valid view outlet.`);
        }

        return routeFn(extras.selfViewRef, this._viewPartGridUrlObserver.snapshot.serialize());
      }
      default: {
        throw Error('Not supported routing view target.');
      }
    }
  }

  public resolve(commands: any[]): WorkbenchView[] {
    return this.resolvePresentViewRefs(commands).map(viewRef => this._viewRegistry.getElseThrow(viewRef));
  }

  /**
   * Resolves present views which match the given URL path.
   */
  public resolvePresentViewRefs(commands: any[]): string[] {
    const commandsJoined = commands.filter(it => typeof it !== 'object').map(it => encodeURI(it)).join(); // do not match URL matrix parameters
    const urlTree = this._router.parseUrl(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    return Object.keys(urlSegmentGroups)
      .filter(it => {
        return it.startsWith(VIEW_REF_PREFIX) && (urlSegmentGroups[it].segments.map((segment: UrlSegment) => segment.path).join() === commandsJoined);
      });
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
   */
  public normalizeCommands(commands: any[], relativeTo?: ActivatedRoute | null): any[] {
    const normalizeFn = (outlet: string, extras?: NavigationExtras): any[] => {
      return this._router.createUrlTree(commands, extras)
        .root.children[outlet].segments
        .reduce((acc, p) => [...acc, p.path, ...(Object.keys(p.parameters).length ? [p.parameters] : [])], []);
    };

    if (!relativeTo) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    const targetOutlet = relativeTo.pathFromRoot[1] && relativeTo.pathFromRoot[1].outlet;
    if (!targetOutlet || (!targetOutlet.startsWith(VIEW_REF_PREFIX) && !targetOutlet.startsWith(ACTIVITY_OUTLET_NAME))) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    return normalizeFn(targetOutlet, {relativeTo});
  }
}

/**
 * Represents the extra options used during navigation.
 */
export interface WbNavigationExtras extends NavigationExtras {
  /**
   * If there exists a view with the specified URL in the workbench, that view is activated.
   * Otherwise, depending on the view target strategy, a new workbench view is created, which is by default,
   * or the URL is loaded into the current view.
   *
   * @deprecated use 'activateIfPresent'; will be removed in the next release
   */
  tryActivateView?: boolean;
  /**
   * Activates the view if it is already present.
   * If not present, the view is opened according to the specified 'target' strategy.
   */
  activateIfPresent?: boolean;
  /**
   * Closes the view if present. Has no effect if no view is present which matches the qualifier.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * 'blank': opens the view as a new workbench view (which is by default)
   * 'self':  opens the view in the current workbench view
   */
  target?: 'blank' | 'self';
  /**
   * Specifies the view which to replace when using 'self' view target strategy.
   * If not specified and if in the context of a workbench view, that view is used as the self target.
   */
  selfViewRef?: string;
  /**
   * Specifies the viewpart where to attach the new view when using 'blank' view target strategy.
   * If not specified, the active workbench viewpart is used as the 'blank' target.
   */
  blankViewPartRef?: string;
}
