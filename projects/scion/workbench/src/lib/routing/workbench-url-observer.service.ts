/*
* Copyright (c) 2018-2022 Swiss Federal Railways
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*/

import {Event, GuardsCheckEnd, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {filter} from 'rxjs/operators';
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {WorkbenchAuxiliaryRoutesRegistrator} from './workbench-auxiliary-routes-registrator.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM} from '../workbench.constants';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {ViewComponent} from '../view/view.component';
import {WorkbenchNavigationContext, WorkbenchRouter} from './workbench-router.service';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {WorkbenchLayoutDiffer} from './workbench-layout-differ';
import {WorkbenchPopupDiffer} from './workbench-popup-differ';
import {Logger, LoggerNames} from '../logging';
import {WorkbenchRouteData} from './workbench-route-data';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';
import {MainAreaLayoutComponent} from '../layout/main-area-layout/main-area-layout.component';
import {PartComponent} from '../part/part.component';
import {MAIN_AREA_PART_ID} from '../layout/workbench-layout';
import {canDeactivateWorkbenchView} from '../view/workbench-view-pre-destroy.guard';
import {resolveWorkbenchNavigationState} from './navigation-state.resolver';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Tracks the browser URL for workbench layout changes.
 *
 * - For each added view, constructs a {@link WorkbenchView} and registers view specific auxiliary routes of all primary routes
 * - For each removed view, destroys {@link WorkbenchView} and unregisters its auxiliary routes
 * - For each added part, constructs a {@link WorkbenchPart}
 * - For each removed part, destroys {@link WorkbenchPart}
 * - Parses the serialized layout and injects it into {@link WorkbenchLayoutService}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchUrlObserver {

  constructor(private _router: Router,
              private _auxRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _partRegistry: WorkbenchPartRegistry,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _environmentInjector: EnvironmentInjector,
              private _workbenchRouter: WorkbenchRouter,
              private _workbenchLayoutFactory: WorkbenchLayoutFactory,
              private _workbenchLayoutDiffer: WorkbenchLayoutDiffer,
              private _workbenchPopupDiffer: WorkbenchPopupDiffer,
              private _logger: Logger) {
    this.installRouterEventListeners();
  }

  /** Invoked at the beginning of each navigation */
  private onNavigationStart(event: NavigationStart): void {
    const context = this.createWorkbenchNavigationContext(event.url);
    this._logger.debug(() => 'onNavigationStart', LoggerNames.ROUTING, event, `NavigationContext [parts=${context.layout.parts().map(part => part.id)}, layoutDiff=${context.layoutDiff.toString()}, popupDiff=${context.popupDiff.toString()}]`);
    this._workbenchRouter.setCurrentNavigationContext(context);
    this.registerAddedViewAuxiliaryRoutes();
    this.registerAddedPopupAuxiliaryRoutes();
  }

  /** Invoked upon successful navigation */
  private onNavigationEnd(event: NavigationEnd): void {
    this._logger.debug(() => 'onNavigationEnd', LoggerNames.ROUTING, event);
    this.unregisterRemovedOutletAuxiliaryRoutes();
    this.updateViewRegistry();
    this.updatePartRegistry();
    this.applyWorkbenchLayout();
    this.migrateURL();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when cancelled the navigation, e.g., in a guard */
  private onNavigationCancel(event: NavigationCancel): void {
    this._logger.debug(() => 'onNavigationCancel', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchLayoutDiffer();
    this.undoWorkbenchPopupDiffer();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when the navigation failed */
  private onNavigationError(event: NavigationError): void {
    this._logger.debug(() => 'onNavigationError', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchLayoutDiffer();
    this.undoWorkbenchPopupDiffer();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked after checked guards for activation */
  private onGuardsCheckEnd(event: GuardsCheckEnd): void {
    this._logger.debug(() => `onGuardsCheckEnd [shouldActivate=${event.shouldActivate}]`, LoggerNames.ROUTING, event);
  }

  /**
   * Creates the context of the current navigation. The context provides access to the new layout and how it differs from the current layout.
   */
  private createWorkbenchNavigationContext(url: string): WorkbenchNavigationContext {
    const urlTree = this._router.parseUrl(url);
    const workbenchNavigationalState = WorkbenchNavigationalStates.fromNavigation(this._router.getCurrentNavigation()!);

    const layout = this._workbenchLayoutFactory.create({
      mainGrid: (() => {
        // Read the main grid from the query parameter.
        const mainAreaLayout = urlTree.queryParamMap.get(MAIN_AREA_LAYOUT_QUERY_PARAM) ?? urlTree.queryParamMap.get('parts'); // TODO [Angular 17] Remove fallback to 'parts' query parameter
        if (mainAreaLayout) {
          return mainAreaLayout;
        }

        // Do not fall back to the current layout if the navigation was performed via the Workbench Router.
        const isWorkbenchRouterNavigation = workbenchNavigationalState !== null;
        if (isWorkbenchRouterNavigation) {
          return null;
        }

        // Do not fall back to the current layout if the navigation was triggered from outside the Angular Router, i.e., the browser back/forward buttons.
        const isExternalNavigation = this._router.getCurrentNavigation()!.trigger === 'popstate';
        if (isExternalNavigation) {
          return null;
        }

        // Fall back to the current layout if the navigation was performed via the Angular router, i.e., the navigator did not preserve the query params.
        return this._workbenchLayoutService.layout?.mainGrid ?? null;
      })(),
      peripheralGrid: workbenchNavigationalState ? workbenchNavigationalState.peripheralGrid : this._workbenchLayoutService.layout?.peripheralGrid,
      maximized: workbenchNavigationalState ? workbenchNavigationalState.maximized : this._workbenchLayoutService.layout?.maximized,
    });
    return {
      layout,
      layoutDiff: this._workbenchLayoutDiffer.diff(layout, urlTree),
      popupDiff: this._workbenchPopupDiffer.diff(urlTree),
    };
  }

  /**
   * For each added view, registers auxiliary routes of all primary routes.
   */
  private registerAddedViewAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const addedViewOutlets = navigationContext.layoutDiff.addedViewOutlets;

    const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerOutletAuxiliaryRoutes(addedViewOutlets, {
      canDeactivate: [canDeactivateWorkbenchView],
      resolve: {[WorkbenchRouteData.state]: resolveWorkbenchNavigationState},
    });
    if (newAuxiliaryRoutes.length) {
      this._logger.debug(() => `Registered auxiliary routes for views: ${addedViewOutlets}`, LoggerNames.ROUTING, newAuxiliaryRoutes);
    }
  }

  /**
   * For each added popup, registers auxiliary routes of all primary routes.
   */
  public registerAddedPopupAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const addedPopupOutlets = navigationContext.popupDiff.addedPopupOutlets;

    const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerOutletAuxiliaryRoutes(addedPopupOutlets);
    if (newAuxiliaryRoutes.length) {
      this._logger.debug(() => `Registered auxiliary routes for popups: ${addedPopupOutlets}`, LoggerNames.ROUTING, newAuxiliaryRoutes);
    }
  }

  /**
   * Reverts the workbench layout differ to the state before the navigation.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoWorkbenchLayoutDiffer(): void {
    const prevNavigateLayout = this._workbenchLayoutService.layout; // Layout in `WorkbenchLayoutService` is only updated after successful navigation
    const prevNavigateUrl = this._router.parseUrl(this._router.url); // Browser URL is only updated after successful navigation
    this._workbenchLayoutDiffer.diff(prevNavigateLayout, prevNavigateUrl);
  }

  /**
   * Reverts the popup outlet differ to the state before the navigation.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoWorkbenchPopupDiffer(): void {
    const prevNavigateUrl = this._router.parseUrl(this._router.url); // Browser URL is only updated after successful navigation
    this._workbenchPopupDiffer.diff(prevNavigateUrl);
  }

  /**
   * Undoes the registration of auxiliary routes.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoAuxiliaryRoutesRegistration(): void {
    const layoutDiff = this._workbenchRouter.getCurrentNavigationContext().layoutDiff;
    const popupDiff = this._workbenchRouter.getCurrentNavigationContext().popupDiff;
    const addedOutlets: string[] = [...layoutDiff.addedViewOutlets, ...popupDiff.addedPopupOutlets];
    if (addedOutlets.length) {
      this._auxRoutesRegistrator.unregisterOutletAuxiliaryRoutes(addedOutlets);
      this._logger.debug(() => `Undo auxiliary routes registration for outlet(s): ${addedOutlets}`, LoggerNames.ROUTING);
    }
  }

  /**
   * Sets the workbench layout to {@link WorkbenchLayoutService}, but only if navigating through the workbench router.
   *
   * Note: Apply the layout after navigation ended to not run into the following error: 'Cannot activate an already activated outlet'.
   */
  private applyWorkbenchLayout(): void {
    const layout = this._workbenchRouter.getCurrentNavigationContext().layout;
    if (layout !== this._workbenchLayoutService.layout) { // Layout instance does not change if navigating through the Angular router.
      this._logger.debug(() => 'Applying workbench layout', LoggerNames.ROUTING, layout);
      this._workbenchLayoutService.setLayout(layout);
    }
  }

  /**
   * Updates the URL if the layout has been migrated from an outdated version.
   */
  private migrateURL(): void {
    const layout = this._workbenchRouter.getCurrentNavigationContext().layout;
    if (layout.mainGrid.migrated) {
      // Update the URL with the migrated URL and clear existing query params, for example, if the layout query parameter has been renamed.
      this._workbenchRouter.ɵnavigate(layout => layout, {queryParamsHandling: null, replaceUrl: true}).then();
    }
  }

  /**
   * Unregisters auxiliary routes of removed workbench outlets.
   */
  private unregisterRemovedOutletAuxiliaryRoutes(): void {
    const layoutDiff = this._workbenchRouter.getCurrentNavigationContext().layoutDiff;
    const popupDiff = this._workbenchRouter.getCurrentNavigationContext().popupDiff;
    const removedOutlets: string[] = [...layoutDiff.removedViewOutlets, ...popupDiff.removedPopupOutlets];
    if (removedOutlets.length) {
      this._logger.debug(() => 'Unregistering outlet auxiliary routes: ', LoggerNames.ROUTING, removedOutlets);
      this._auxRoutesRegistrator.unregisterOutletAuxiliaryRoutes(removedOutlets);
    }
  }

  /**
   * - For each added view, constructs a {@link WorkbenchView} and registers it in {@link WorkbenchViewRegistry}
   * - For each removed view, destroys the {@link WorkbenchView} and unregisters it in {@link WorkbenchViewRegistry}
   */
  private updateViewRegistry(): void {
    const {layoutDiff, layout} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.addedViews.forEach(viewId => {
      this._logger.debug(() => `Constructing ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.register(this.createWorkbenchView(viewId));
    });
    layoutDiff.removedViews.forEach(viewId => {
      this._logger.debug(() => `Destroying ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.unregister(viewId);
    });

    // Update view properties.
    layout.views().forEach(view => {
      this._viewRegistry.get(view.id).setPartId(layout.part({by: {viewId: view.id}}).id);
    });
  }

  /**
   * - For each added part, constructs a {@link WorkbenchPart} and registers it in {@link WorkbenchPartRegistry}
   * - For each removed part, destroys the {@link WorkbenchPart} and unregisters it in {@link WorkbenchPartRegistry}
   * - Updates part properties, e.g., the active view
   */
  private updatePartRegistry(): void {
    const {layoutDiff, layout} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.addedParts.forEach(partId => {
      this._logger.debug(() => `Constructing ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.register(this.createWorkbenchPart(partId, layout.isInMainArea(partId)));
    });
    layoutDiff.removedParts.forEach(partId => {
      this._logger.debug(() => `Destroying ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.unregister(partId);
    });

    // Update part properties.
    const activePartIds = new Set<string>()
      .add(layout.activePart({scope: 'peripheral'}).id)
      .add(layout.activePart({scope: 'main'}).id);

    layout.parts().forEach(part => {
      this._partRegistry.get(part.id).setPart(part, activePartIds.has(part.id));
    });
  }

  private createWorkbenchPart(partId: string, isInMainArea: boolean): ɵWorkbenchPart {
    return runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchPart(partId, {
      component: partId === MAIN_AREA_PART_ID ? MainAreaLayoutComponent : PartComponent,
      isInMainArea,
    }));
  }

  private createWorkbenchView(viewId: string): ɵWorkbenchView {
    return runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchView(viewId, {component: ViewComponent}));
  }

  private installRouterEventListeners(): void {
    this._router.events
      .pipe(
        filter((event: Event | RouterEvent): event is RouterEvent => event instanceof RouterEvent),
        takeUntilDestroyed(),
      )
      .subscribe((event: RouterEvent) => {
        if (event instanceof NavigationStart) {
          this.onNavigationStart(event);
        }
        else if (event instanceof NavigationEnd) {
          this.onNavigationEnd(event);
        }
        else if (event instanceof NavigationCancel) {
          this.onNavigationCancel(event);
        }
        else if (event instanceof NavigationError) {
          this.onNavigationError(event);
        }
        else if (event instanceof GuardsCheckEnd) {
          this.onGuardsCheckEnd(event);
        }
      });
  }
}
