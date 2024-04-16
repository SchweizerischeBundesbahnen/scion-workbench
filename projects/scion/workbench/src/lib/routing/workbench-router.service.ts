/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {WorkbenchDialogDiff} from './workbench-dialog-differ';

/**
 * Enables navigation of workbench views and modification of the workbench layout.
 *
 * A view is a visual workbench element for displaying content side-by-side or stacked. A view can be navigated to any route.
 *
 * A view can inject `ActivatedRoute` to obtain parameters passed to the navigation and/or read data associated with the route.
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
   * Navigates based on the provided array of commands and extras. This method is similar to Angular's `Router.navigate(...)`, but with a view as the navigation target.
   *
   * A command can be a string or an object literal. A string represents a path segment, an object literal associates data with the preceding path segment.
   * Multiple segments can be combined into a single command, separated by a forward slash.
   *
   * By default, the router opens a new view if no view is found that matches the specified path. Matrix parameters do not affect view resolution.
   * If one or more views match the path, they will be navigated instead of opening the view in a new view tab, e.g., to update matrix parameters.
   * This behavior can be changed by setting an explicit navigation target in navigation extras.
   *
   * By default, navigation is absolute. Set `relativeTo` in extras for relative navigation.
   *
   * The router supports for closing views matching the routing commands by setting `close` in navigation extras.
   *
   * ### Usage
   * ```
   * inject(WorkbenchRouter).navigate(['team', 33, 'user', 11]);
   * inject(WorkbenchRouter).navigate(['team/11/user', userName, {details: true}]); // multiple static segments can be merged into one
   * inject(WorkbenchRouter).navigate(['teams', {selection: 33'}]); // matrix parameter `selection` with the value `33`.
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
          if (commands.length || extras.hint || extras.relativeTo) {
            throw Error('[NavigateError] Commands, hint, or relativeTo must not be set when closing a view by id.');
          }
          return layout.removeView(extras.target);
        }
        const urlSegments = RouterUtils.commandsToSegments(commands, {relativeTo: extras.relativeTo});
        return layout
          .views({
            partId: extras.partId,
            segments: new UrlSegmentMatcher(urlSegments, {matchMatrixParams: false, matchWildcardPath: true}),
            navigationHint: extras.hint ?? null,
          })
          .reduce((layout, view) => layout.removeView(view.id), layout);
      });
    }

    return this.ɵnavigate((layout: ɵWorkbenchLayout): ɵWorkbenchLayout | null => {
      switch (extras.target ?? 'auto') {
        case 'blank': {
          return addView(layout.computeNextViewId(), layout);
        }
        case 'auto': {
          const urlSegments = RouterUtils.commandsToSegments(commands, {relativeTo: extras.relativeTo});
          const views = layout.views({
            partId: extras.partId,
            segments: new UrlSegmentMatcher(urlSegments, {matchMatrixParams: false, matchWildcardPath: false}),
            navigationHint: extras.hint ?? null,
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
      // Default to the active part (with the active part of the main area taking precedence) if not specified or not in the layout.
      const partId = ((): string => {
        if (extras.partId && layout.hasPart(extras.partId)) {
          return extras.partId;
        }
        return layout.activePart({grid: 'mainArea'})?.id ?? layout.activePart({grid: 'workbench'}).id;
      })();

      return layout
        .addView(viewId, {
          partId: partId,
          position: extras.blankInsertionIndex ?? 'after-active-view',
          activateView: extras.activate ?? true,
        })
        .navigateView(viewId, commands, {
          relativeTo: extras.relativeTo,
          hint: extras.hint,
          cssClass: extras.cssClass,
          state: extras.state,
        });
    }

    /**
     * Creates the navigation for updating the specified view.
     */
    function updateView(viewId: string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
      if (extras.activate ?? true) {
        layout = layout.activateView(viewId);
      }

      return layout.navigateView(viewId, commands, {
        relativeTo: extras.relativeTo,
        hint: extras.hint,
        cssClass: extras.cssClass,
        state: extras.state,
      });
    }
  }

  /**
   * Experimental API for modifying the workbench layout.
   *
   * @param onNavigate - Callback to modify the current layout.
   *        Receives the current layout and can return a modified layout for navigation. Returning `null` cancels navigation.
   *        The callback can call `inject` to get any required dependencies.
   * @param extras - Controls how to perform the navigation.
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

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      const newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return true;
      }

      // Create extras with workbench navigation instructions.
      extras = createNavigationExtras(newLayout, extras);

      // Create the new URL tree.
      const commands: Commands = computeNavigationCommands(currentLayout.viewOutlets(), newLayout.viewOutlets());
      const urlTree = this._router.createUrlTree(commands, extras);

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
   *        Receives the current layout and can return a modified layout for navigation. Returning `null` cancels navigation.
   *        The callback can call `inject` to get any required dependencies.
   * @param extras - Options to control navigation.
   *
   * @internal
   */
  public async createUrlTree(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<UrlTree | null> {
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

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      const newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return null;
      }

      // Create extras with workbench navigation instructions.
      extras = createNavigationExtras(newLayout, extras);

      // Create the new URL tree.
      const commands: Commands = computeNavigationCommands(currentLayout.viewOutlets(), newLayout.viewOutlets());
      return this._router.createUrlTree(commands, extras);
    });
  }

  /**
   * Returns the context of the current workbench navigation, when being invoked during navigation, or throws an error otherwise.
   *
   * @internal
   */
  public getCurrentNavigationContext(): WorkbenchNavigationContext {
    if (!this._currentNavigationContext) {
      throw Error('[NavigateError] Navigation context not available because no navigation is in progress.');
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
 * Options to control the navigation.
 */
export interface WorkbenchNavigationExtras extends NavigationExtras {
  /**
   * Instructs the router to activate the view. Default is `true`.
   */
  activate?: boolean;
  /**
   * Closes views that match the specified path. Matrix parameters do not affect view resolution.
   * The path supports the asterisk wildcard segment (`*`) to match views with any value in a segment.
   * To close a specific view, set a view target instead of a path.
   */
  close?: boolean;
  /**
   * Controls where to open the view. Default is `auto`.
   *
   * One of:
   * - 'auto':   Navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.
   * - 'blank':  Navigates in a new view.
   * - <viewId>: Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.
   */
  target?: ViewId | string | 'blank' | 'auto';
  /**
   * Sets a hint to control navigation, e.g., for use in a `CanMatch` guard to differentiate between routes with an identical path.
   *
   * For example, views of the initial layout or a perspective are usually navigated to the empty path route to avoid cluttering the URL,
   * requiring a navigation hint to differentiate between the routes. See {@link canMatchWorkbenchView} for an example.
   *
   * Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.
   *
   * @see canMatchWorkbenchView
   */
  hint?: string;
  /**
   * Controls which part to navigate views in.
   *
   * If target is `blank`, opens the view in the specified part.
   * If target is `auto`, navigates matching views in the specified part, or opens a new view in that part otherwise.
   *
   * If the specified part is not in the layout, opens the view in the active part, with the active part of the main area taking precedence.
   */
  partId?: string;
  /**
   * Specifies where to insert the view into the tab bar. Has no effect if navigating an existing view. Default is after the active view.
   */
  blankInsertionIndex?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  /**
   * Associates arbitrary state with a view navigation.
   *
   * Navigational state is stored in the browser's session history, supporting back/forward navigation, but is lost on page reload.
   * Therefore, a view must be able to restore its state without relying on navigational state.
   *
   * Navigational state can be read from {@link WorkbenchView.state} or the browser's session history via `history.state`.
   */
  state?: ViewState;
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}

/**
 * Contextual data of a workbench navigation available in the router during navigation.
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
  /**
   * Dialogs added or removed by the current navigation.
   */
  dialogDiff: WorkbenchDialogDiff;
}

/**
 * Creates navigation extras with workbench navigation instructions.
 */
function createNavigationExtras(layout: ɵWorkbenchLayout, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): NavigationExtras {
  const {workbenchGrid, mainAreaGrid} = layout.serialize();

  return {
    ...extras,
    // Instruct the Angular router to process the navigation even if the URL does not change, e.g., when changing the workbench grid which is not contained in the URL.
    onSameUrlNavigation: 'reload',
    // Unset `relativeTo` because commands are already normalized to their absolute form.
    relativeTo: null,
    // Associate workbench-specific state with the navigation.
    state: WorkbenchNavigationalStates.create({
      workbenchGrid: workbenchGrid,
      maximized: layout.maximized,
      viewStates: layout.viewStates(),
    }),
    // Add the main area as query parameter.
    queryParams: {...extras?.queryParams, [MAIN_AREA_LAYOUT_QUERY_PARAM]: mainAreaGrid},
    // Merge with existing query params unless specified an explicit strategy, e.g., for migrating an outdated layout URL.
    // Note that `null` is a valid strategy for clearing existing query params, so do not use the nullish coalescing operator (??).
    queryParamsHandling: Defined.orElse(extras?.queryParamsHandling, 'merge'),
  };
}

/**
 * Creates commands to be passed to the Angular router to navigate view outlets of the new layout and to remove view outlets of removed views.
 */
function computeNavigationCommands(previousViewOutlets: ViewOutlets, nextViewOutlets: ViewOutlets): [{outlets: {[outlet: ViewId]: Commands | null}}] | [] {
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
    else if (!new UrlSegmentMatcher(previousViewOutletMap.get(viewId)!, {matchMatrixParams: true, matchWildcardPath: false}).matches(nextViewOutletMap.get(viewId)!)) {
      commands.set(viewId, RouterUtils.segmentsToCommands(nextViewOutletMap.get(viewId)!));
    }
  });

  // Add view commands to the 'outlets' property to be interpreted by the Angular router.
  return commands.size ? [{outlets: Object.fromEntries(commands)}] : [];
}
