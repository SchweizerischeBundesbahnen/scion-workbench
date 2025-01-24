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
import {Defined} from '@scion/toolkit/util';
import {assertNotInReactiveContext, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM, WorkbenchOutlet} from '../workbench.constants';
import {ANGULAR_ROUTER_MUTEX, SingleTaskExecutor} from '../executor/single-task-executor';
import {firstValueFrom} from 'rxjs';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {Routing} from './routing.util';
import {Commands, Outlets, WorkbenchNavigationContext, WorkbenchNavigationExtras} from './routing.model';
import {UrlSegmentMatcher} from './url-segment-matcher';
import {Objects} from '../common/objects.util';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {ViewId} from '../view/workbench-view.model';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchRouter implements WorkbenchRouter {

  private readonly _router = inject(Router);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchViewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);
  /** Mutex to serialize Workbench Router navigation requests, preventing race conditions when modifying the active workbench layout to operate on the most-recent layout. */
  private readonly _workbenchRouterMutex = new SingleTaskExecutor();
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);
  /** Holds the current navigational context during a workbench navigation, or `null` if no navigation is in progress. */
  private _currentNavigationContext: WorkbenchNavigationContext | null = null;

  constructor() {
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
  public async navigate(commandsOrNavigateFn: Commands | ɵNavigateFn, extras?: WorkbenchNavigationExtras | Omit<NavigationExtras, 'relativeTo' | 'state'>): Promise<boolean> {
    assertNotInReactiveContext(this.navigate, 'Call WorkbenchRouter.navigate() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.navigate(commandsOrNavigateFn, extras));
    }

    const navigateFn = typeof commandsOrNavigateFn === 'function' ? commandsOrNavigateFn : createNavigationFromCommands(commandsOrNavigateFn, extras ?? {});

    // Serialize navigation requests to avoid race conditions when modifying the active workbench layout, ensuring layout operations are performed on the most-recent layout.
    const newLayout = await this._workbenchRouterMutex.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, this navigation would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout()) {
        await this.waitForInitialLayout();
      }

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout()!;
      let newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => navigateFn(currentLayout)) as ɵWorkbenchLayout;
      if (!newLayout) {
        return null;
      }

      // Remove views marked for removal that have no `CanClose` guard.
      // Views with a `CanClose` guard are removed later, outside the navigation mutex, to avoid blocking the workbench router.
      newLayout = this.removeViewsWithoutGuard(newLayout);

      // Skip navigation if the layout has not changed, such as when only closing views with a `CanClose` guard.
      if (newLayout.equals(currentLayout, {excludeViewMarkedForRemoval: true})) {
        return newLayout;
      }

      // Create extras with workbench navigation instructions.
      extras = createNavigationExtras({newLayout, currentLayout}, extras);

      // Perform the navigation.
      const commands: Commands = computeNavigationCommands(currentLayout.outlets(), newLayout.outlets());
      if (!await this._angularRouterMutex.submit(() => this._router.navigate(commands, extras))) {
        return null;
      }

      // Block subsequent navigation(s) until Angular has flushed the changed layout to the DOM.
      await firstValueFrom(this._zone.onStable);
      return newLayout;
    });

    if (!newLayout) {
      return false;
    }

    // Remove views marked for removal, confirming closing by calling each view's `CanClose` guard.
    return this.scheduleViewRemoval(newLayout);
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
    assertNotInReactiveContext(this.createUrlTree, 'Call WorkbenchRouter.createUrlTree() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.createUrlTree(onNavigate, extras));
    }

    // Serialize navigation requests to avoid race conditions when modifying the active workbench layout, ensuring layout operations are performed on the most-recent layout.
    return this._workbenchRouterMutex.submit(async () => {
      // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
      // Otherwise, would override the initial layout as given in the URL.
      if (!this._workbenchLayoutService.layout()) {
        await this.waitForInitialLayout();
      }

      // Let the navigator compute the new workbench layout.
      const currentLayout = this._workbenchLayoutService.layout()!;
      let newLayout: ɵWorkbenchLayout | null = await runInInjectionContext(this._injector, () => onNavigate(currentLayout));
      if (!newLayout) {
        return null;
      }

      // Remove views marked for removal.
      newLayout.views({markedForRemoval: true}).forEach(view => {
        newLayout = newLayout!.removeView(view.id, {force: true});
      });

      // Create extras with workbench navigation instructions.
      extras = createNavigationExtras({newLayout, currentLayout}, extras);

      // Create the new URL tree.
      const commands: Commands = computeNavigationCommands(currentLayout.outlets(), newLayout.outlets());
      return this._router.createUrlTree(commands, extras);
    });
  }

  /**
   * Remove views marked for removal that have no `CanClose` guard.
   */
  private removeViewsWithoutGuard(layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    return layout.views({markedForRemoval: true}).reduce((layout, mView) => {
      const view = this._workbenchViewRegistry.get(mView.id, {orElse: null});
      if (!view || (view.closable() && !view.canCloseGuard)) {
        return layout.removeView(mView.id, {force: true});
      }
      return layout;
    }, layout);
  }

  /**
   * Removes views marked for removal, confirming closing by calling each view's `CanClose` guard.
   *
   * Guards are executed in parallel, and views are removed in separate navigations.
   *
   * @return a Promise that resolves to `true` when all marked views were successfully closed or declined closing.
   */
  private async scheduleViewRemoval(layout: ɵWorkbenchLayout): Promise<boolean> {
    const navigations = layout.views({markedForRemoval: true})
      .map(mView => this._workbenchViewRegistry.get(mView.id, {orElse: null}))
      .filter((view): view is ɵWorkbenchView => !!view && view.closable())
      .map(async view => {
        // Capture current navigation id to not proceed closing if navigated in the meantime.
        const navigationId = view.navigation()?.id;
        // Make view non-closable to prevent closing the view again while awaiting closing confirmation.
        view.closable = false;
        try {
          const close = await view.canCloseGuard!();
          if (close && view.navigation()?.id === navigationId) {
            return this.navigate(layout => layout.removeView(view.id, {force: true}));
          }
          return true;
        }
        finally {
          view.closable = true;
        }
      });

    // Wait for all `CanClose` guards to resolve and subsequent navigations to complete.
    return (await Promise.all(navigations)).every(Boolean);
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
      const urlSegments = Routing.commandsToSegments(commands, {relativeTo: extras.relativeTo});
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
          const urlSegments = Routing.commandsToSegments(commands, {relativeTo: extras.relativeTo});
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
  function addView(viewId: ViewId | string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
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
        data: extras.data,
        state: extras.state,
      });
  }

  /**
   * Updates the specified view.
   */
  function updateView(viewId: ViewId | string, layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    if (extras.activate ?? true) {
      layout = layout.activateView(viewId, {activatePart: true});
    }

    return layout.navigateView(viewId, commands, {
      relativeTo: extras.relativeTo,
      hint: extras.hint,
      cssClass: extras.cssClass,
      data: extras.data,
      state: extras.state,
    });
  }
}

/**
 * Creates navigation extras with workbench navigation instructions.
 */
function createNavigationExtras(layouts: {newLayout: ɵWorkbenchLayout; currentLayout?: ɵWorkbenchLayout | undefined}, extras?: Omit<NavigationExtras, 'relativeTo' | 'state'>): NavigationExtras {
  const {newLayout, currentLayout} = layouts;
  const {workbenchGrid, mainAreaGrid} = newLayout.serialize({excludeViewMarkedForRemoval: true});

  // IMPORTANT: Update `ɵWorkbenchLayout.equals` function when adding new state properties.

  return {
    ...extras,
    // Instruct the Angular router to process the navigation even if the URL does not change, e.g., when changing the workbench grid which is not contained in the URL.
    onSameUrlNavigation: 'reload',
    // Unset `relativeTo` because commands are already normalized to their absolute form.
    relativeTo: null,
    // Associate workbench-specific state with the navigation.
    state: WorkbenchNavigationalStates.create({
      workbenchGrid: workbenchGrid,
      // Fall back to the current layout's perspective if not specified by the new layout,
      // e.g., the navigator provides a new layout to replace the current layout.
      perspectiveId: newLayout.perspectiveId ?? currentLayout?.perspectiveId,
      maximized: newLayout.maximized,
      navigationStates: newLayout.navigationStates(),
    }),
    // Add the main area as query parameter.
    queryParams: {...extras?.queryParams, [MAIN_AREA_LAYOUT_QUERY_PARAM]: mainAreaGrid},
    // Merge with existing query params unless specified an explicit strategy, e.g., for migrating an outdated layout URL.
    // Note that `null` is a valid strategy for clearing existing query params, so do not use the nullish coalescing operator (??).
    queryParamsHandling: Defined.orElse(extras?.queryParamsHandling, 'merge'),
  };
}

/**
 * Computes commands that can be passed to the Angular router to navigate views and parts.
 */
function computeNavigationCommands(currentOutlets: Outlets, newOutlets: Outlets): [{outlets: {[outlet: WorkbenchOutlet]: Commands | null}}] | [] {
  const currentOutletMap = new Map<WorkbenchOutlet, UrlSegment[]>(Objects.entries(currentOutlets));
  const newOutletMap = new Map<WorkbenchOutlet, UrlSegment[]>(Objects.entries(newOutlets));

  const commands = new Map<WorkbenchOutlet, Commands | null>();
  const outlets = new Set<WorkbenchOutlet>([...currentOutletMap.keys(), ...newOutletMap.keys()]);

  outlets.forEach(outlet => {
    // Test if the outlet was added to the layout.
    if (!currentOutletMap.has(outlet)) {
      commands.set(outlet, Routing.segmentsToCommands(newOutletMap.get(outlet)!));
    }
    // Test if the outlet was removed from the layout.
    else if (!newOutletMap.has(outlet)) {
      commands.set(outlet, null);
    }
    // Test if the outlet was changed.
    else if (!new UrlSegmentMatcher(currentOutletMap.get(outlet)!, {matchMatrixParams: true, matchWildcardPath: false}).matches(newOutletMap.get(outlet)!)) {
      commands.set(outlet, Routing.segmentsToCommands(newOutletMap.get(outlet)!));
    }
  });

  // Add commands to the 'outlets' property to be interpreted by the Angular router.
  return commands.size ? [{outlets: Object.fromEntries(commands)}] : [];
}

/**
 * @inheritDoc
 * @see NavigateFn
 */
export type ɵNavigateFn = (layout: ɵWorkbenchLayout) => Promise<ɵWorkbenchLayout | null> | ɵWorkbenchLayout | null;
