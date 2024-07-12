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
import {WorkbenchRouter} from './workbench-router.service';
import {Defined, Observables} from '@scion/toolkit/util';
import {inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM} from '../workbench.constants';
import {SINGLE_NAVIGATION_EXECUTOR} from '../executor/single-task-executor';
import {firstValueFrom} from 'rxjs';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {RouterUtils} from './router.util';
import {Commands, ViewOutlets, WorkbenchNavigationContext, WorkbenchNavigationExtras} from './routing.model';
import {ViewId} from '../view/workbench-view.model';
import {UrlSegmentMatcher} from './url-segment-matcher';
import {Objects} from '../common/objects.util';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {Logger} from '../logging';
import {CanClose} from '../workbench.model';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchRouter implements WorkbenchRouter {

  private _singleNavigationExecutor = inject(SINGLE_NAVIGATION_EXECUTOR);

  /**
   * Holds the current navigational context during a workbench navigation, or `null` if no navigation is in progress.
   */
  private _currentNavigationContext: WorkbenchNavigationContext | null = null;

  constructor(private _router: Router,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchViewRegistry: WorkbenchViewRegistry,
              private _injector: Injector,
              private _logger: Logger,
              private _zone: NgZone) {
    // Instruct the Angular router to process navigations that do not change the current URL, i.e., when only updating navigation state.
    // For example, the workbench grid is passed to the navigation as state, not as a query parameter. Without this flag set, changes to
    // the workbench grid would not be added to the browsing history stack.
    // Although the `onSameUrlNavigation` flag can be set per navigation via the navigation extras, this is not sufficient because the
    // Angular router ignores it when navigating back and forth in the browsing history.
    // See Angular router.ts#setUpLocationChangeListener and router.ts#navigateToSyncWithBrowser
    this._router.onSameUrlNavigation = 'reload';
  }

  /** @inheritDoc */
  public navigate(commands: Commands, extras?: WorkbenchNavigationExtras): Promise<boolean>;
  public navigate(navigateFn: ɵNavigateFn, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean>;
  public navigate(commandsOrNavigateFn: Commands | ɵNavigateFn, extras?: WorkbenchNavigationExtras | Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean>;
  public navigate(commandsOrNavigateFn: Commands | ɵNavigateFn, extras?: WorkbenchNavigationExtras | Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.navigate(commandsOrNavigateFn, extras));
    }

    const navigateFn = typeof commandsOrNavigateFn === 'function' ? commandsOrNavigateFn : createNavigationFromCommands(commandsOrNavigateFn, extras ?? {});

    // Serialize navigation requests to prevent race conditions when modifying the currently active workbench layout.
    return this._singleNavigationExecutor.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, this navigation would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout) {
        await this.waitForInitialLayout();
      }

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      let newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => navigateFn(currentLayout)) as ɵWorkbenchLayout;
      if (!newLayout) {
        return true;
      }

      // Remove views marked for removal, invoking `CanClose` guard if implemented.
      newLayout = await newLayout.removeViewsMarkedForRemoval(viewUid => this.canCloseView(viewUid));

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
   * Performs changes to the current workbench layout.
   *
   * Unlike {@link navigate}, does not perform the navigation but returns the URL tree instead.
   *
   * The router will invoke the callback and pass the current layout for modification. The callback can call `inject` to get any required dependencies.
   *
   * The following example adds a part to the left of the main area, inserts a view and navigates it.
   *
   * ```ts
   * inject(WorkbenchRouter).createUrlTree(layout => layout
   *   .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
   *   .addView('navigator', {partId: 'left'})
   *   .navigateView('navigator', ['path/to/view'])
   *   .activateView('navigator'),
   * );
   * ```
   *
   * @param onNavigate - Specifies the callback to modify the layout.
   * @param extras - Controls how to perform the navigation.
   * @see NavigateFn
   */
  public async createUrlTree(onNavigate: (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<UrlTree | null> {
    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.createUrlTree(onNavigate, extras));
    }

    return this._singleNavigationExecutor.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout) {
        await this.waitForInitialLayout();
      }

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout!;
      let newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return null;
      }

      // Remove views marked for removal.
      newLayout = await newLayout.removeViewsMarkedForRemoval();

      // Create extras with workbench navigation instructions.
      extras = createNavigationExtras(newLayout, extras);

      // Create the new URL tree.
      const commands: Commands = computeNavigationCommands(currentLayout.viewOutlets(), newLayout.viewOutlets());
      return this._router.createUrlTree(commands, extras);
    });
  }

  /**
   * Decides if given view can be closed, invoking `CanClose` guard if implemented.
   */
  private async canCloseView(viewUid: string): Promise<boolean> {
    const view = this._workbenchViewRegistry.views.find(view => view.uid === viewUid);
    if (!view) {
      return true;
    }
    if (!view.closable) {
      return false;
    }

    // Test if the view implements `CanClose` guard.
    const component = view.getComponent() as CanClose | null;
    if (typeof component?.canClose !== 'function') {
      return true;
    }

    // Invoke `CanClose` guard to decide if to close the view.
    try {
      const canClose = runInInjectionContext(view.getComponentInjector()!, () => component.canClose());
      return await firstValueFrom(Observables.coerce(canClose), {defaultValue: true});
    }
    catch (error) {
      this._logger.error(`Unhandled error while invoking 'CanClose' guard of view '${view.id}'.`, error);
      return true;
    }
  }

  /**
   * Returns the context of the current workbench navigation, when being invoked during navigation, or throws an error otherwise.
   */
  public getCurrentNavigationContext(): WorkbenchNavigationContext {
    if (!this._currentNavigationContext) {
      throw Error('[NavigateError] Navigation context not available because no navigation is in progress.');
    }
    return this._currentNavigationContext;
  }

  /**
   * Sets navigational contextual data.
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
}

/**
 * Creates a navigation to navigate view(s) based on the provided array of commands and extras.
 */
function createNavigationFromCommands(commands: Commands, extras: WorkbenchNavigationExtras): ɵNavigateFn {
  return (layout: ɵWorkbenchLayout): ɵWorkbenchLayout | null => {
    if (extras.close) {
      if (extras.target) {
        if (commands.length || extras.hint || extras.partId || extras.relativeTo) {
          throw Error('[NavigateError] Commands, hint, part or relativeTo must not be set when closing a view by id.');
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
    }
    else {
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
    }
  };

  /**
   * Adds the specified view to the layout.
   */
  function addView(viewId: string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    // Default to the active part if not specified or not in the layout, with the active part of the main area taking precedence.
    const partId = ((): string => {
      if (extras.partId && layout.hasPart(extras.partId)) {
        return extras.partId;
      }
      return layout.activePart({grid: 'mainArea'})?.id ?? layout.activePart({grid: 'workbench'}).id;
    })();

    return layout
      .addView(viewId, {
        partId: partId,
        position: extras.position ?? 'after-active-view',
        activateView: extras.activate ?? true,
        activatePart: extras.activate ?? true,
      })
      .navigateView(viewId, commands, {
        relativeTo: extras.relativeTo,
        hint: extras.hint,
        cssClass: extras.cssClass,
        state: extras.state,
      });
  }

  /**
   * Updates the specified view.
   */
  function updateView(viewId: string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    if (extras.activate ?? true) {
      layout = layout.activateView(viewId, {activatePart: true});
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
 * Creates navigation extras with workbench navigation instructions.
 */
function createNavigationExtras(layout: ɵWorkbenchLayout, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): NavigationExtras {
  const {workbenchGrid, mainAreaGrid} = layout.serialize({excludeViewMarkedForRemoval: true});

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
 * Computes commands that can be passed to the Angular router to navigate view outlets and to remove view outlets of removed views.
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

/**
 * @inheritDoc
 * @see NavigateFn
 */
export type ɵNavigateFn = (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null;
