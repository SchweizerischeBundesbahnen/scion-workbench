/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { GuardsCheckEnd, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Route, Router, RouterEvent } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ComponentFactoryResolver, Injectable, Injector, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkbenchAuxiliaryRoutesRegistrator } from './routing/workbench-auxiliary-routes-registrator.service';
import { PARTS_LAYOUT_QUERY_PARAM, ROUTER_OUTLET_NAME } from './workbench.constants';
import { WorkbenchViewRegistry } from './view/workbench-view.registry';
import { WorkbenchViewPartRegistry } from './view-part/workbench-view-part.registry';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { ɵWorkbenchViewPart } from './view-part/ɵworkbench-view-part.model';
import { WbComponentPortal } from './portal/wb-component-portal';
import { ViewPartComponent } from './view-part/view-part.component';
import { WorkbenchViewPart } from './view-part/workbench-view-part.model';
import { ɵWorkbenchView } from './view/ɵworkbench-view.model';
import { ViewComponent } from './view/view.component';
import { WorkbenchView } from './view/workbench-view.model';
import { WorkbenchNavigationContext, WorkbenchRouter } from './routing/workbench-router.service';
import { PartsLayoutFactory } from './layout/parts-layout.factory';
import { WorkbenchLayoutDiffer } from './routing/workbench-layout-differ';

/**
 * Enable this option when debugging the workbench navigation for detailed logging.
 */
const debugLogEnabled = false;

/**
 * Tracks the browser URL for layout changes.
 *
 * - For each added view, constructs a {@link WorkbenchView} and registers view specific auxiliary routes of all primary routes
 * - For each removed view, destroys {@link WorkbenchView} and unregisters its auxiliary routes
 * - For each added part, constructs a {@link WorkbenchViewPart}
 * - For each removed part, destroys {@link WorkbenchViewPart}
 * - Parses the serialized layout and provides it to {@link WorkbenchLayoutService}.
 */
@Injectable()
export class WorkbenchUrlObserver implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _undoRouteRegistrationFn: () => void;

  constructor(private _router: Router,
              private _auxRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _layoutService: WorkbenchLayoutService,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _injector: Injector,
              private _workbenchRouter: WorkbenchRouter,
              private _partsLayoutFactory: PartsLayoutFactory,
              private _workbenchLayoutDiffer: WorkbenchLayoutDiffer) {
    this.installRouterEventListeners();
  }

  /** Invoked at the beginning of each navigation */
  private onNavigationStart(event: NavigationStart): void {
    logDebug(() => 'NavigationStart');
    const context = this.computeWorkbenchLayoutDiff(event.url);
    this._workbenchRouter.setCurrentNavigationContext(context);
    this.logNavigationContext(context);
    this.registerOutletRoutes();
  }

  /** Invoked upon successful navigation */
  private onNavigationEnd(event: NavigationEnd): void {
    logDebug(() => 'onNavigationEnd');
    this.applyPartsLayout();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when cancelled the navigation, e.g., in a guard */
  private onNavigationCancel(event: NavigationCancel): void {
    logDebug(() => 'onNavigationCancel');
    this.undoWorkbenchLayoutDiffer();
    this.undoRouteRegistration();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when the navigation failed */
  private onNavigationError(event: NavigationError): void {
    logDebug(() => 'onNavigationError');
    this.undoWorkbenchLayoutDiffer();
    this.undoRouteRegistration();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked after checked guards for activation */
  private onGuardsCheckEnd(event: GuardsCheckEnd): void {
    logDebug(() => 'onGuardsCheckEnd');
    // If all guards allow the route's activation, apply the workbench layout.
    if (!event.shouldActivate) {
      return;
    }

    this.unregisterRemovedViewOutletRoutes();

    // IMPORTANT: Updating the registries must be done in 'GuardsCheckEnd' and not in 'NavigationEnd' lifecycle hook for the following reason:
    // When registering new view outlets, respective view router outlets are instantiated. Later in the routing process,
    // while Angular router activates routes, already instantiated router outlets are activated and their components mounted.
    // If the outlets would not be instantiated yet, they would get activated only once attached to the DOM.
    // Early activation is important for inactive views to set their view title, e.g. when reloading the application.
    this.updateViewRegistry();
    this.updateViewPartRegistry();
  }

  /**
   * Parses the serialized layout and computes differences between the given layout and the layout as given in the last invocation.
   */
  private computeWorkbenchLayoutDiff(url: string): WorkbenchNavigationContext {
    const urlTree = this._router.parseUrl(url);
    const serializedPartsLayout = urlTree.queryParamMap.get(PARTS_LAYOUT_QUERY_PARAM);
    const partsLayout = this._partsLayoutFactory.create(serializedPartsLayout);
    return {
      ...this._workbenchLayoutDiffer.diff(urlTree, partsLayout),
      partsLayout,
    };
  }

  /**
   * For each view outlet added, registers view specific auxiliary routes of all primary routes.
   */
  private registerOutletRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    this._undoRouteRegistrationFn = null;

    if (!navigationContext.viewOutletChanges) {
      return;
    }

    const viewIds: string[] = [];
    navigationContext.viewOutletChanges.forEachAddedItem(({item}) => viewIds.push(item));
    const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerViewAuxiliaryRoutes(...viewIds);

    // Prepare undo action in case navigation is rejected, e.g. by a routing guard.
    this._undoRouteRegistrationFn = (): void => {
      this._auxRoutesRegistrator.replaceRouterConfig(this._router.config.filter(route => !newAuxiliaryRoutes.includes(route)));
    };
  }

  /**
   * Reverts the layout differ to the state before navigation started.
   *
   * To be invoked if the navigation failed or was cancelled. Navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoWorkbenchLayoutDiffer(): void {
    const preNavigateUrl = this._router.url; // Browser URL is only updated after successful navigation
    const preNavigateLayout = this._layoutService.layout; // Layout in `LayoutService` is only updated after successful navigation
    this._workbenchLayoutDiffer.diff(this._router.parseUrl(preNavigateUrl), preNavigateLayout);
  }

  /**
   * Undoes the registration of view auxiliary routes.
   *
   * To be invoked if the navigation failed or was cancelled. Navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoRouteRegistration(): void {
    this._undoRouteRegistrationFn && this._undoRouteRegistrationFn();
    this._undoRouteRegistrationFn = null;
  }

  /**
   * Sets the parts layout to {@link WorkbenchLayoutService} to be applied to the DOM.
   *
   * Note: Apply the layout after navigation ended to not run into the following error: 'Cannot activate an already activated outlet'.
   */
  private applyPartsLayout(): void {
    const currentNavigation = this._workbenchRouter.getCurrentNavigationContext();
    logDebug(() => `Applying workbench layout`, currentNavigation.partsLayout);
    this._layoutService.setLayout(currentNavigation.partsLayout);
  }

  /**
   * Unregisters auxiliary routes of removed view outlets.
   */
  private unregisterRemovedViewOutletRoutes(): void {
    const viewOutletChanges = this._workbenchRouter.getCurrentNavigationContext().viewOutletChanges;
    if (!viewOutletChanges) {
      return;
    }

    const routes = this._router.config;
    const discardedRoutes: Route[] = [];

    viewOutletChanges.forEachRemovedItem(({item}) => {
      discardedRoutes.push(...routes.filter(route => route.outlet === item));
    });

    if (discardedRoutes.length > 0) {
      this._auxRoutesRegistrator.replaceRouterConfig(routes.filter(route => !discardedRoutes.includes(route)));
    }
  }

  /**
   * - For each added view, constructs a {@link WorkbenchView} and registers it in {@link WorkbenchViewRegistry}
   * - For each removed view, destroys the {@link WorkbenchView} and unregisters it in {@link WorkbenchViewRegistry}
   */
  private updateViewRegistry(): void {
    const {viewOutletChanges, partsLayout} = this._workbenchRouter.getCurrentNavigationContext();

    viewOutletChanges?.forEachAddedItem(({item}) => {
      logDebug(() => `Constructing view [viewId=${item}]`);
      this._viewRegistry.register(this.createWorkbenchView(item, partsLayout.isViewActive(item)));
    });
    viewOutletChanges?.forEachRemovedItem(({item}) => {
      logDebug(() => `Destroying view [viewId=${item}]`);
      this._viewRegistry.remove(item);
    });
  }

  /**
   * - For each added part, constructs a {@link WorkbenchViewPart} and registers it in {@link WorkbenchViewPartRegistry}
   * - For each removed part, destroys the {@link WorkbenchViewPart} and unregisters it in {@link WorkbenchViewPartRegistry}
   * - Updates part properties, e.g., the active view
   */
  private updateViewPartRegistry(): void {
    const {partChanges, partsLayout} = this._workbenchRouter.getCurrentNavigationContext();

    // Register new parts.
    partChanges?.forEachAddedItem(({item}) => {
      this._viewPartRegistry.register(this.createWorkbenchViewPart(item));
    });

    // Destroy parts which are no longer used.
    const partIdsToRemove: string[] = [];
    partChanges?.forEachRemovedItem(({item}) => partIdsToRemove.push(item));
    if (partIdsToRemove.length) {
      // Invoke `preDestroy` lifecycle hook.
      partIdsToRemove.forEach(partId => {
        logDebug(() => `Pre-Destroying part [partId=${partId}]`);
        this._viewPartRegistry.getElseThrow(partId).preDestroy();
      });

      // Invoke `destroy` lifecycle hook.
      // IMPORTANT: Destroy parts after notifying about the layout change. Otherwise, moving of the last view to another part
      // would fail because the view would already be destroyed.
      this._layoutService.whenLayoutChange().then(() => partIdsToRemove.forEach(partId => {
        logDebug(() => `Destroying part [partId=${partId}]`);
        this._viewPartRegistry.getElseThrow(partId).destroy();
        this._viewPartRegistry.remove(partId);
      }));
    }

    // Update part properties.
    partsLayout.parts.forEach(mPart => {
      this._viewPartRegistry.getElseThrow(mPart.partId).setPart(mPart);
    });
  }

  private createWorkbenchViewPart(partId: string): ɵWorkbenchViewPart {
    const portal = new WbComponentPortal(this._componentFactoryResolver, ViewPartComponent);
    const viewPart = new ɵWorkbenchViewPart(partId, portal, this._injector);

    portal.init({
      injectorTokens: new WeakMap()
        .set(WorkbenchViewPart, viewPart)
        .set(ɵWorkbenchViewPart, viewPart),
    });

    return viewPart;
  }

  private createWorkbenchView(viewId: string, active: boolean): ɵWorkbenchView {
    const portal = new WbComponentPortal(this._componentFactoryResolver, ViewComponent);
    const view = new ɵWorkbenchView(viewId, portal, active, this._injector);

    portal.init({
      injectorTokens: new WeakMap()
        .set(ROUTER_OUTLET_NAME, viewId)
        .set(WorkbenchView, view)
        .set(ɵWorkbenchView, view),
      onAttach: (): void => view.activate(true),
      onDetach: (): void => view.activate(false),
    });

    return view;
  }

  private installRouterEventListeners(): void {
    this._router.events
      .pipe(takeUntil(this._destroy$))
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

  private logNavigationContext(context: WorkbenchNavigationContext): void {
    logDebug(() => {
      const partIds = context.partsLayout.parts.map(part => part.partId);

      const partIdsToAdd: string[] = [];
      context.partChanges?.forEachAddedItem(({item}) => partIdsToAdd.push(item));
      const partIdsToRemove: string[] = [];
      context.partChanges?.forEachRemovedItem(({item}) => partIdsToRemove.push(item));

      const viewOutletIdsToAdd: string[] = [];
      context.viewOutletChanges?.forEachAddedItem(({item}) => viewOutletIdsToAdd.push(item));
      const viewOutletIdsToRemove: string[] = [];
      context.viewOutletChanges?.forEachRemovedItem(({item}) => viewOutletIdsToRemove.push(item));

      return `NavigationContext [${[]
        .concat(`parts=[${partIds}]`)
        .concat(partIdsToAdd.length ? `partsToAdd=[${partIdsToAdd}]` : [])
        .concat(partIdsToRemove.length ? `partsToRemove=[${partIdsToRemove}]` : [])
        .concat(viewOutletIdsToAdd.length ? `viewsToAdd=[${viewOutletIdsToAdd}]` : [])
        .concat(viewOutletIdsToRemove.length ? `viewsToRemove=[${viewOutletIdsToRemove}]` : [])
        .join(', ')}]`;
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function logDebug(message: () => string, ...args: any): void {
  if (debugLogEnabled) {
    console?.debug(`[WORKBENCH-ROUTING] ${message()}`, ...args); // tslint:disable-line:no-console
  }
}
