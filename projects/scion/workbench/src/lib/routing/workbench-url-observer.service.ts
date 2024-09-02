/*
* Copyright (c) 2018-2024 Swiss Federal Railways
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*/

import {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {createEnvironmentInjector, EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {WorkbenchAuxiliaryRouteInstaller} from './workbench-auxiliary-route-installer.service';
import {MAIN_AREA_LAYOUT_QUERY_PARAM} from '../workbench.constants';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {WORKBENCH_PART_REGISTRY} from '../part/workbench-part.registry';
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
import {Routing} from './routing.util';
import {ViewId} from '../view/workbench-view.model';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {WorkbenchNavigationContext} from './routing.model';
import {canMatchNotFoundPage} from './workbench-route-guards';
import {WorkbenchMessageBoxDiffer} from './workbench-message-box-differ';
import {WorkbenchViewOutletDiffer} from './workbench-view-outlet-differ';
import {filter} from 'rxjs/operators';

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

  private readonly _router = inject(Router);
  private readonly _auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _partRegistry = inject(WORKBENCH_PART_REGISTRY);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _workbenchLayoutDiffer = inject(WorkbenchLayoutDiffer);
  private readonly _workbenchViewOutletDiffer = inject(WorkbenchViewOutletDiffer);
  private readonly _workbenchPopupDiffer = inject(WorkbenchPopupDiffer);
  private readonly _workbenchDialogDiffer = inject(WorkbenchDialogDiffer);
  private readonly _workbenchMessageBoxDiffer = inject(WorkbenchMessageBoxDiffer);
  private readonly _logger = inject(Logger);

  constructor() {
    this.installRouterEventListeners();
  }

  /** Invoked at the beginning of each navigation */
  private onNavigationStart(event: NavigationStart): void {
    const context = this.createWorkbenchNavigationContext(event.url);
    this._logger.debug(() => 'onNavigationStart', LoggerNames.ROUTING, event, `NavigationContext [parts=${context.layout.parts().map(part => part.id)}, layoutDiff=${context.layoutDiff.toString()}, popupDiff=${context.popupDiff.toString()}, dialogDiff=${context.dialogDiff.toString()}, messageBoxDiff=${context.messageBoxDiff.toString()}]`);
    this._workbenchRouter.setCurrentNavigationContext(context);
    this.registerAddedOutletAuxiliaryRoutes();
    this.registerAddedWorkbenchParts();
    this.registerAddedWorkbenchViews();
  }

  /** Invoked upon successful navigation */
  private onNavigationEnd(event: NavigationEnd): void {
    this._logger.debug(() => 'onNavigationEnd', LoggerNames.ROUTING, event);
    this.unregisterRemovedOutletAuxiliaryRoutes();
    this.unregisterRemovedWorkbenchParts();
    this.unregisterRemovedWorkbenchViews();
    this.applyWorkbenchLayout();
    this.migrateURL();
    this._workbenchRouter.getCurrentNavigationContext().runPostNavigationActions();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when cancelled the navigation, e.g., in a guard */
  private onNavigationCancel(event: NavigationCancel): void {
    this._logger.debug(() => 'onNavigationCancel', LoggerNames.ROUTING, event);
    this._workbenchRouter.getCurrentNavigationContext().undoChanges();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when the navigation failed */
  private onNavigationError(event: NavigationError): void {
    this._logger.debug(() => 'onNavigationError', LoggerNames.ROUTING, event);
    this._workbenchRouter.getCurrentNavigationContext().undoChanges();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /**
   * Creates the context of the current navigation. The context provides access to the new layout and how it differs from the current layout.
   */
  private createWorkbenchNavigationContext(url: string): WorkbenchNavigationContext {
    const urlTree = this._router.parseUrl(url);
    const workbenchNavigationalState = WorkbenchNavigationalStates.fromNavigation(this._router.getCurrentNavigation()!);
    const previousLayout = this._workbenchLayoutService.layout();
    const previousUrl = this._router.parseUrl(this._router.url); // Browser URL is only updated after successful navigation

    const newLayout = this._workbenchLayoutFactory.create({
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
        return previousLayout?.mainAreaGrid;
      })(),
      workbenchGrid: workbenchNavigationalState?.workbenchGrid ?? previousLayout?.workbenchGrid,
      perspectiveId: workbenchNavigationalState?.perspectiveId ?? previousLayout?.perspectiveId,
      maximized: workbenchNavigationalState?.maximized ?? previousLayout?.maximized,
      navigationStates: workbenchNavigationalState?.navigationStates ?? previousLayout?.navigationStates(),
      viewOutlets: Object.fromEntries(Routing.parseViewOutlets(urlTree)),
    });

    const undoActions = new Array<() => void>();
    const postNavigationActions = new Array<() => void>();

    return {
      layout: newLayout,
      previousLayout,
      layoutDiff: this._workbenchLayoutDiffer.diff(newLayout),
      viewOutletDiff: this._workbenchViewOutletDiffer.diff(newLayout, urlTree),
      popupDiff: this._workbenchPopupDiffer.diff(urlTree),
      dialogDiff: this._workbenchDialogDiffer.diff(urlTree),
      messageBoxDiff: this._workbenchMessageBoxDiffer.diff(urlTree),
      undoChanges: () => {
        // Revert differs to the state before the navigation.
        this._workbenchLayoutDiffer.diff(previousLayout);
        this._workbenchViewOutletDiffer.diff(previousLayout, previousUrl);
        this._workbenchPopupDiffer.diff(previousUrl);
        this._workbenchDialogDiffer.diff(previousUrl);
        this._workbenchMessageBoxDiffer.diff(previousUrl);
        // Run registered undo actions.
        undoActions.forEach(action => action());
      },
      runPostNavigationActions: () => postNavigationActions.forEach(action => action()),
      registerUndoAction: action => undoActions.push(action),
      registerPostNavigationAction: action => postNavigationActions.push(action),
    };
  }

  /**
   * For each added workbench outlet, registers auxiliary routes of all top-level routes.
   */
  private registerAddedOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();

    // Register view auxiliary routes.
    const addedViewOutlets = navigationContext.viewOutletDiff.addedViewOutlets;
    if (addedViewOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRouteInstaller.registerAuxiliaryRoutes(addedViewOutlets, {canMatchNotFoundPage: [canMatchNotFoundPage]});
      this._logger.debug(() => `Registered auxiliary routes for views: ${addedViewOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register popup auxiliary routes.
    const addedPopupOutlets = navigationContext.popupDiff.addedPopupOutlets;
    if (addedPopupOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRouteInstaller.registerAuxiliaryRoutes(addedPopupOutlets);
      this._logger.debug(() => `Registered auxiliary routes for popups: ${addedPopupOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register dialog auxiliary routes.
    const addedDialogOutlets = navigationContext.dialogDiff.addedDialogOutlets;
    if (addedDialogOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRouteInstaller.registerAuxiliaryRoutes(addedDialogOutlets);
      this._logger.debug(() => `Registered auxiliary routes for dialogs: ${addedDialogOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Register message box auxiliary routes.
    const addedMessageBoxOutlets = navigationContext.messageBoxDiff.addedMessageBoxOutlets;
    if (addedMessageBoxOutlets.length) {
      const auxiliaryRoutes = this._auxiliaryRouteInstaller.registerAuxiliaryRoutes(addedMessageBoxOutlets);
      this._logger.debug(() => `Registered auxiliary routes for message boxes: ${addedMessageBoxOutlets}`, LoggerNames.ROUTING, auxiliaryRoutes);
    }

    // Revert registration if the navigation fails.
    navigationContext.registerUndoAction(() => {
      const addedOutlets = [...addedViewOutlets, ...addedPopupOutlets, ...addedDialogOutlets, ...addedMessageBoxOutlets];
      this._auxiliaryRouteInstaller.unregisterAuxiliaryRoutes(addedOutlets);
    });
  }

  /**
   * Unregisters auxiliary routes of removed workbench outlets.
   */
  private unregisterRemovedOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const removedOutlets: string[] = [
      ...navigationContext.viewOutletDiff.removedViewOutlets,
      ...navigationContext.popupDiff.removedPopupOutlets,
      ...navigationContext.dialogDiff.removedDialogOutlets,
      ...navigationContext.messageBoxDiff.removedMessageBoxOutlets,
    ];
    if (removedOutlets.length) {
      this._logger.debug(() => 'Unregistering outlet auxiliary routes: ', LoggerNames.ROUTING, removedOutlets);
      this._auxiliaryRouteInstaller.unregisterAuxiliaryRoutes(removedOutlets);
    }
  }

  /**
   * For each added part, constructs a {@link WorkbenchPart} and registers it in {@link WORKBENCH_PART_REGISTRY}.
   */
  private registerAddedWorkbenchParts(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const {layoutDiff} = navigationContext;

    layoutDiff.addedParts.forEach(partId => {
      this._logger.debug(() => `Constructing ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.register(this.createWorkbenchPart(partId));
      navigationContext.registerUndoAction(() => this._partRegistry.unregister(partId));
    });
  }

  /**
   * For each removed part, destroys the {@link WorkbenchPart} and unregisters it in {@link WORKBENCH_PART_REGISTRY}.
   */
  private unregisterRemovedWorkbenchParts(): void {
    const {layoutDiff} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.removedParts.forEach(partId => {
      this._logger.debug(() => `Destroying ɵWorkbenchPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._partRegistry.unregister(partId);
    });
  }

  /**
   * For each added view, constructs a {@link WorkbenchView} and registers it in {@link WORKBENCH_VIEW_REGISTRY}.
   */
  private registerAddedWorkbenchViews(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const {layoutDiff} = navigationContext;

    layoutDiff.addedViews.forEach(viewId => {
      this._logger.debug(() => `Constructing ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.register(this.createWorkbenchView(viewId));
      navigationContext.registerUndoAction(() => this._viewRegistry.unregister(viewId));
    });
  }

  /**
   * For each removed view, destroys the {@link WorkbenchView} and unregisters it from {@link WORKBENCH_VIEW_REGISTRY}.
   */
  private unregisterRemovedWorkbenchViews(): void {
    const {layoutDiff} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.removedViews.forEach(viewId => {
      this._logger.debug(() => `Destroying ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.unregister(viewId);
    });
  }

  private createWorkbenchPart(partId: string): ɵWorkbenchPart {
    // Construct the handle in an injection context that shares the part's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const partEnvironmentInjector = createEnvironmentInjector([], this._environmentInjector, `Workbench Part ${partId}`);
    return runInInjectionContext(partEnvironmentInjector, () => new ɵWorkbenchPart(partId, {
      component: partId === MAIN_AREA ? MainAreaLayoutComponent : PartComponent,
    }));
  }

  private createWorkbenchView(viewId: ViewId): ɵWorkbenchView {
    // Construct the handle in an injection context that shares the view's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const viewEnvironmentInjector = createEnvironmentInjector([], this._environmentInjector, `Workbench View ${viewId}`);
    return runInInjectionContext(viewEnvironmentInjector, () => new ɵWorkbenchView(viewId, {component: ViewComponent}));
  }

  /**
   * Applies the current layout to the workbench.
   */
  private applyWorkbenchLayout(): void {
    const {layout} = this._workbenchRouter.getCurrentNavigationContext();
    this._workbenchLayoutService.setLayout(layout);
    this._logger.debug(() => 'Applied workbench layout', LoggerNames.ROUTING, layout);
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
      });
  }
}
