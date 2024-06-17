/*
* Copyright (c) 2018-2024 Swiss Federal Railways
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
import {WorkbenchLayoutDiffer} from './workbench-layout-differ';
import {WorkbenchPopupDiffer} from './workbench-popup-differ';
import {Logger, LoggerNames} from '../logging';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';
import {MainAreaLayoutComponent} from '../layout/main-area-layout/main-area-layout.component';
import {PartComponent} from '../part/part.component';
import {MAIN_AREA} from '../layout/workbench-layout';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {WorkbenchDialogDiffer} from './workbench-dialog-differ';
import {RouterUtils} from './router.util';
import {ViewId} from '../view/workbench-view.model';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {WorkbenchNavigationContext} from './routing.model';
import {canMatchNotFoundPage} from '../view/workbench-view-route-guards';
import {WorkbenchMessageBoxDiffer} from './workbench-message-box-differ';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchViewAuxiliaryRoutesDiffer} from './workbench-view-differ';

/**
 * Tracks the browser URL for workbench layout changes.
 *
 * - For each added view, constructs a {@link WorkbenchView} and registers view specific auxiliary routes of all top-level routes
 * - For each removed view, destroys {@link WorkbenchView} and unregisters its auxiliary routes
 * - For each added part, constructs a {@link WorkbenchPart}
 * - For each removed part, destroys {@link WorkbenchPart}
 * - Parses the serialized layout and injects it into {@link WorkbenchLayoutService}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchUrlObserver {

  constructor(private _router: Router,
              private _auxiliaryRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _partRegistry: WorkbenchPartRegistry,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _environmentInjector: EnvironmentInjector,
              private _workbenchRouter: ɵWorkbenchRouter,
              private _workbenchLayoutFactory: ɵWorkbenchLayoutFactory,
              private _workbenchLayoutDiffer: WorkbenchLayoutDiffer,
              private _workbenchViewAuxiliaryRoutesDiffer: WorkbenchViewAuxiliaryRoutesDiffer,
              private _workbenchPopupDiffer: WorkbenchPopupDiffer,
              private _workbenchDialogDiffer: WorkbenchDialogDiffer,
              private _workbenchMessageBoxDiffer: WorkbenchMessageBoxDiffer,
              private _logger: Logger) {
    this.installRouterEventListeners();
  }

  /** Invoked at the beginning of each navigation */
  private onNavigationStart(event: NavigationStart): void {
    const context = this.createWorkbenchNavigationContext(event.url);
    this._logger.debug(() => 'onNavigationStart', LoggerNames.ROUTING, event, `NavigationContext [parts=${context.layout.parts().map(part => part.id)}, layoutDiff=${context.layoutDiff.toString()}, popupDiff=${context.popupDiff.toString()}, dialogDiff=${context.dialogDiff.toString()}, messageBoxDiff=${context.messageBoxDiff.toString()}]`);
    this._workbenchRouter.setCurrentNavigationContext(context);
    this.registerAddedOutletAuxiliaryRoutes();
  }

  /** Invoked upon successful navigation */
  private onNavigationEnd(event: NavigationEnd): void {
    this._logger.debug(() => 'onNavigationEnd', LoggerNames.ROUTING, event);
    this.unregisterRemovedOutletAuxiliaryRoutes();
    this.applyWorkbenchLayoutChanges();
    this.publishWorkbenchLayout();
    this.migrateURL();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when cancelled the navigation, e.g., in a guard */
  private onNavigationCancel(event: NavigationCancel): void {
    this._logger.debug(() => 'onNavigationCancel', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchDiffers();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when the navigation failed */
  private onNavigationError(event: NavigationError): void {
    this._logger.debug(() => 'onNavigationError', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchDiffers();
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
      mainAreaGrid: (() => {
        // Read the main area grid from the query parameter.
        const mainAreaGrid = urlTree.queryParamMap.get(MAIN_AREA_LAYOUT_QUERY_PARAM);
        if (mainAreaGrid) {
          return mainAreaGrid;
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
        return this._workbenchLayoutService.layout?.mainAreaGrid;
      })(),
      workbenchGrid: workbenchNavigationalState?.workbenchGrid ?? this._workbenchLayoutService.layout?.workbenchGrid,
      maximized: workbenchNavigationalState?.maximized ?? this._workbenchLayoutService.layout?.maximized,
      viewStates: workbenchNavigationalState?.viewStates ?? this._workbenchLayoutService.layout?.viewStates(),
      viewOutlets: Object.fromEntries(RouterUtils.parseViewOutlets(urlTree)),
    });

    return {
      layout,
      layoutDiff: this._workbenchLayoutDiffer.diff(layout),
      viewAuxiliaryRouteDiff: this._workbenchViewAuxiliaryRoutesDiffer.diff(layout, urlTree),
      popupDiff: this._workbenchPopupDiffer.diff(urlTree),
      dialogDiff: this._workbenchDialogDiffer.diff(urlTree),
      messageBoxDiff: this._workbenchMessageBoxDiffer.diff(urlTree),
    };
  }

  /**
   * For each added workbench outlet, registers auxiliary routes of all top-level routes.
   */
  private registerAddedOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();

    // Register view auxiliary routes.
    const addedViews = navigationContext.viewAuxiliaryRouteDiff.addedViews;
    if (addedViews.length) {
      const auxiliaryRoutes = this._auxiliaryRoutesRegistrator.registerAuxiliaryRoutes(addedViews, {canMatchNotFoundPage: [canMatchNotFoundPage]});
      this._logger.debug(() => `Registered auxiliary routes for views: ${addedViews}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register popup auxiliary routes.
    const addedPopupOutlets = navigationContext.popupDiff.addedPopupOutlets;
    if (addedPopupOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRoutesRegistrator.registerAuxiliaryRoutes(addedPopupOutlets);
      this._logger.debug(() => `Registered auxiliary routes for popups: ${addedPopupOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register dialog auxiliary routes.
    const addedDialogOutlets = navigationContext.dialogDiff.addedDialogOutlets;
    if (addedDialogOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRoutesRegistrator.registerAuxiliaryRoutes(addedDialogOutlets);
      this._logger.debug(() => `Registered auxiliary routes for dialogs: ${addedDialogOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register message box auxiliary routes.
    const addedMessageBoxOutlets = navigationContext.messageBoxDiff.addedMessageBoxOutlets;
    if (addedMessageBoxOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRoutesRegistrator.registerAuxiliaryRoutes(addedMessageBoxOutlets);
      this._logger.debug(() => `Registered auxiliary routes for message boxes: ${addedMessageBoxOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }
  }

  /**
   * Reverts the workbench differs to the state before the navigation.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoWorkbenchDiffers(): void {
    const prevNavigateLayout = this._workbenchLayoutService.layout; // Layout in `WorkbenchLayoutService` is only updated after successful navigation
    const prevNavigateUrl = this._router.parseUrl(this._router.url); // Browser URL is only updated after successful navigation
    this._workbenchLayoutDiffer.diff(prevNavigateLayout);
    this._workbenchViewAuxiliaryRoutesDiffer.diff(prevNavigateLayout, prevNavigateUrl);
    this._workbenchPopupDiffer.diff(prevNavigateUrl);
    this._workbenchDialogDiffer.diff(prevNavigateUrl);
    this._workbenchMessageBoxDiffer.diff(prevNavigateUrl);
  }

  /**
   * Undoes the registration of auxiliary routes.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoAuxiliaryRoutesRegistration(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const addedOutlets: string[] = [
      ...navigationContext.viewAuxiliaryRouteDiff.addedViews,
      ...navigationContext.popupDiff.addedPopupOutlets,
      ...navigationContext.dialogDiff.addedDialogOutlets,
      ...navigationContext.messageBoxDiff.addedMessageBoxOutlets,
    ];
    if (addedOutlets.length) {
      this._auxiliaryRoutesRegistrator.unregisterAuxiliaryRoutes(addedOutlets);
      this._logger.debug(() => `Undo auxiliary routes registration for outlet(s): ${addedOutlets}`, LoggerNames.ROUTING);
    }
  }

  /**
   * Updates registries and workbench handles to reflect the new layout.
   */
  private applyWorkbenchLayoutChanges(): void {
    const {layout} = this._workbenchRouter.getCurrentNavigationContext();
    if (layout !== this._workbenchLayoutService.layout) { // Layout instance does not change if navigating through the Angular router.
      this.updateViewRegistry();
      this.updatePartRegistry();

      layout.views().forEach(view => this._viewRegistry.get(view.id).onLayoutChange(layout));
      layout.parts().forEach(part => this._partRegistry.get(part.id).onLayoutChange(layout));
    }
  }

  /**
   * Publishes the workbench layout via {@link WorkbenchLayoutService}, similar to a transactional commit.
   */
  private publishWorkbenchLayout(): void {
    const {layout} = this._workbenchRouter.getCurrentNavigationContext();
    if (layout !== this._workbenchLayoutService.layout) {
      // Layout instance only changes when navigating via the workbench router, but not via the Angular router, e.g., when not navigating views.
      this._logger.debug(() => 'Publishing workbench layout', LoggerNames.ROUTING, layout);
      this._workbenchLayoutService.setLayout(layout);
    }
  }

  /**
   * Updates the URL if the layout has been migrated from an outdated version.
   */
  private migrateURL(): void {
    const layout = this._workbenchRouter.getCurrentNavigationContext().layout;
    if (layout.mainAreaGrid?.migrated) {
      // Update the URL with the migrated URL and clear existing query params, for example, if the layout query parameter has been renamed.
      this._workbenchRouter.navigate(layout => layout, {queryParamsHandling: null, replaceUrl: true}).then();
    }
  }

  /**
   * Unregisters auxiliary routes of removed workbench outlets.
   */
  private unregisterRemovedOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const removedOutlets: string[] = [
      ...navigationContext.viewAuxiliaryRouteDiff.removedViews,
      ...navigationContext.popupDiff.removedPopupOutlets,
      ...navigationContext.dialogDiff.removedDialogOutlets,
      ...navigationContext.messageBoxDiff.removedMessageBoxOutlets,
    ];
    if (removedOutlets.length) {
      this._logger.debug(() => 'Unregistering outlet auxiliary routes: ', LoggerNames.ROUTING, removedOutlets);
      this._auxiliaryRoutesRegistrator.unregisterAuxiliaryRoutes(removedOutlets);
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
      this._viewRegistry.register(this.createWorkbenchView(viewId, layout));
    });
    layoutDiff.removedViews.forEach(viewId => {
      this._logger.debug(() => `Destroying ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.unregister(viewId);
    });
  }

  /**
   * - For each added part, constructs a {@link WorkbenchPart} and registers it in {@link WorkbenchPartRegistry}
   * - For each removed part, destroys the {@link WorkbenchPart} and unregisters it in {@link WorkbenchPartRegistry}
   */
  private updatePartRegistry(): void {
    const {layoutDiff} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.addedParts.forEach(partId => {
      this._logger.debug(() => `Constructing ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.register(this.createWorkbenchPart(partId));
    });
    layoutDiff.removedParts.forEach(partId => {
      this._logger.debug(() => `Destroying ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.unregister(partId);
    });
  }

  private createWorkbenchPart(partId: string): ɵWorkbenchPart {
    return runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchPart(partId, {
      component: partId === MAIN_AREA ? MainAreaLayoutComponent : PartComponent,
    }));
  }

  private createWorkbenchView(viewId: ViewId, layout: ɵWorkbenchLayout): ɵWorkbenchView {
    return runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchView(viewId, {component: ViewComponent, layout}));
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
