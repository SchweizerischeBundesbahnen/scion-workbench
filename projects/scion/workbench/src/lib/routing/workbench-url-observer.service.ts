/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ChildrenOutletContexts, GuardsCheckEnd, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {ComponentFactoryResolver, Injectable, Injector, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {WorkbenchAuxiliaryRoutesRegistrator} from './workbench-auxiliary-routes-registrator.service';
import {PARTS_LAYOUT_QUERY_PARAM, ROUTER_OUTLET_NAME} from '../workbench.constants';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchViewPartRegistry} from '../view-part/workbench-view-part.registry';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ɵWorkbenchViewPart} from '../view-part/ɵworkbench-view-part.model';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {ViewPartComponent} from '../view-part/view-part.component';
import {WorkbenchViewPart} from '../view-part/workbench-view-part.model';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {ViewComponent} from '../view/view.component';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchNavigationContext, WorkbenchRouter} from './workbench-router.service';
import {PartsLayoutFactory} from '../layout/parts-layout.factory';
import {WorkbenchLayoutDiffer} from './workbench-layout-differ';
import {Logger, LoggerNames} from '../logging';
import {WbAddViewToPartGuard} from './add-view-to-part.guard';
import {WbBeforeDestroyGuard} from '../view/wb-before-destroy.guard';
import {NavigationStateResolver} from './navigation-state.resolver';
import {WB_STATE_DATA} from './routing.constants';

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

  constructor(private _router: Router,
              private _auxRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _layoutService: WorkbenchLayoutService,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _injector: Injector,
              private _workbenchRouter: WorkbenchRouter,
              private _partsLayoutFactory: PartsLayoutFactory,
              private _workbenchLayoutDiffer: WorkbenchLayoutDiffer,
              private _logger: Logger) {
    this.installRouterEventListeners();
  }

  /** Invoked at the beginning of each navigation */
  private onNavigationStart(event: NavigationStart): void {
    const context = this.computeWorkbenchLayoutDiff(event.url);
    this._logger.debug(() => 'onNavigationStart', LoggerNames.ROUTING, event, `NavigationContext [parts=${context.partsLayout.parts.map(part => part.partId)}, layoutDiff=${context.layoutDiff.toString()}]`);
    this._workbenchRouter.setCurrentNavigationContext(context);
    this.registerAddedViewOutletAuxiliaryRoutes();
    this.registerAddedPopupOutletAuxiliaryRoutes();
  }

  /** Invoked upon successful navigation */
  private onNavigationEnd(event: NavigationEnd): void {
    this._logger.debug(() => 'onNavigationEnd', LoggerNames.ROUTING, event);
    this.unregisterRemovedOutletAuxiliaryRoutes();
    this.updateViewRegistry();
    this.updateViewPartRegistry();
    this.applyPartsLayout();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when cancelled the navigation, e.g., in a guard */
  private onNavigationCancel(event: NavigationCancel): void {
    this._logger.debug(() => 'onNavigationCancel', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchLayoutDiffer();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked when the navigation failed */
  private onNavigationError(event: NavigationError): void {
    this._logger.debug(() => 'onNavigationError', LoggerNames.ROUTING, event);
    this.undoAuxiliaryRoutesRegistration();
    this.undoWorkbenchLayoutDiffer();
    this._workbenchRouter.setCurrentNavigationContext(null);
  }

  /** Invoked after checked guards for activation */
  private onGuardsCheckEnd(event: GuardsCheckEnd): void {
    this._logger.debug(() => `onGuardsCheckEnd [shouldActivate=${event.shouldActivate}]`, LoggerNames.ROUTING, event);
  }

  /**
   * Parses the serialized layout and computes differences between the given layout and the layout as given in the last invocation.
   */
  private computeWorkbenchLayoutDiff(url: string): WorkbenchNavigationContext {
    const urlTree = this._router.parseUrl(url);
    const serializedPartsLayout = urlTree.queryParamMap.get(PARTS_LAYOUT_QUERY_PARAM) ?? undefined;
    const partsLayout = this._partsLayoutFactory.create(serializedPartsLayout);
    return {
      partsLayout,
      layoutDiff: this._workbenchLayoutDiffer.diff(urlTree, partsLayout),
    };
  }

  /**
   * For each view outlet added, registers view outlet auxiliary routes of all primary routes.
   */
  private registerAddedViewOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const addedViewOutlets = navigationContext.layoutDiff.addedViews;

    const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerOutletAuxiliaryRoutes(addedViewOutlets, {
      canActivate: [WbAddViewToPartGuard],
      canDeactivate: [WbBeforeDestroyGuard],
      resolve: {[WB_STATE_DATA]: NavigationStateResolver},
    });
    if (newAuxiliaryRoutes.length) {
      this._logger.debug(() => `Registered auxiliary routes for view outlet(s): ${addedViewOutlets}`, LoggerNames.ROUTING, newAuxiliaryRoutes);
    }
  }

  /**
   * For each popup outlet added, registers popup outlet auxiliary routes of all primary routes.
   */
  public registerAddedPopupOutletAuxiliaryRoutes(): void {
    const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
    const addedPopupOutlets = navigationContext.layoutDiff.addedPopups;

    const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerOutletAuxiliaryRoutes(addedPopupOutlets);
    if (newAuxiliaryRoutes.length) {
      this._logger.debug(() => `Registered auxiliary routes for popup outlet(s): ${addedPopupOutlets}`, LoggerNames.ROUTING, newAuxiliaryRoutes);
    }
  }

  /**
   * Reverts the layout differ to the state before the navigation.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoWorkbenchLayoutDiffer(): void {
    const prevNavigateUrl = this._router.url; // Browser URL is only updated after successful navigation
    const prevNavigateLayout = this._layoutService.layout; // Layout in `LayoutService` is only updated after successful navigation
    this._workbenchLayoutDiffer.diff(this._router.parseUrl(prevNavigateUrl), prevNavigateLayout ?? undefined);
  }

  /**
   * Undoes the registration of auxiliary routes.
   *
   * Invoke this method after navigation failure or cancellation. The navigation is cancelled when guards perform a redirect or reject navigation.
   */
  private undoAuxiliaryRoutesRegistration(): void {
    const layoutDiff = this._workbenchRouter.getCurrentNavigationContext().layoutDiff;
    const addedOutlets: string[] = [...layoutDiff.addedViews, ...layoutDiff.addedPopups];
    if (addedOutlets.length) {
      this._auxRoutesRegistrator.unregisterOutletAuxiliaryRoutes(addedOutlets);
      this._logger.debug(() => `Undo auxiliary routes registration for outlet(s): ${addedOutlets}`, LoggerNames.ROUTING);
    }
  }

  /**
   * Sets the parts layout to {@link WorkbenchLayoutService} to be applied to the DOM.
   *
   * Note: Apply the layout after navigation ended to not run into the following error: 'Cannot activate an already activated outlet'.
   */
  private applyPartsLayout(): void {
    const currentNavigation = this._workbenchRouter.getCurrentNavigationContext();
    this._logger.debug(() => 'Applying workbench layout', LoggerNames.ROUTING, currentNavigation.partsLayout);
    this._layoutService.setLayout(currentNavigation.partsLayout);
  }

  /**
   * Unregisters auxiliary routes of removed workbench outlets.
   */
  private unregisterRemovedOutletAuxiliaryRoutes(): void {
    const layoutDiff = this._workbenchRouter.getCurrentNavigationContext().layoutDiff;
    const removedOutlets: string[] = [...layoutDiff.removedViews, ...layoutDiff.removedPopups];
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
    const {layoutDiff, partsLayout} = this._workbenchRouter.getCurrentNavigationContext();

    layoutDiff.addedViews.forEach(viewId => {
      this._logger.debug(() => `Constructing ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.register(this.createWorkbenchView(viewId, partsLayout.isViewActive(viewId)));

    });
    layoutDiff.removedViews.forEach(viewId => {
      this._logger.debug(() => `Destroying ɵWorkbenchView [viewId=${viewId}]`, LoggerNames.LIFECYCLE);
      this._viewRegistry.remove(viewId);
    });
  }

  /**
   * - For each added part, constructs a {@link WorkbenchViewPart} and registers it in {@link WorkbenchViewPartRegistry}
   * - For each removed part, destroys the {@link WorkbenchViewPart} and unregisters it in {@link WorkbenchViewPartRegistry}
   * - Updates part properties, e.g., the active view
   */
  private updateViewPartRegistry(): void {
    const {layoutDiff, partsLayout} = this._workbenchRouter.getCurrentNavigationContext();

    // Register new parts.
    layoutDiff.addedParts.forEach(partId => {
      this._logger.debug(() => `Constructing ɵWorkbenchViewPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
      this._viewPartRegistry.register(this.createWorkbenchViewPart(partId));
    });

    // Destroy parts which are no longer used.
    if (layoutDiff.removedParts.length) {
      // Invoke `preDestroy` lifecycle hook.
      layoutDiff.removedParts.forEach(partId => {
        this._logger.debug(() => `Pre-Destroying ɵWorkbenchViewPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
        this._viewPartRegistry.getElseThrow(partId).preDestroy();
      });

      // Invoke `destroy` lifecycle hook.
      // IMPORTANT: Destroy parts after notifying about the layout change. Otherwise, moving of the last view to another part
      // would fail because the view would already be destroyed.
      this._layoutService.whenLayoutChange().then(() => layoutDiff.removedParts.forEach(partId => {
        this._logger.debug(() => `Destroying ɵWorkbenchViewPart [partId=${partId}]`, LoggerNames.LIFECYCLE);
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
        .set(ɵWorkbenchView, view)
        // Provide the root parent outlet context, crucial if the outlet is not instantiated at the time the route gets activated (e.g., if inside a `ngIf`, as it is in {ViewComponent}).
        // Otherwise, the outlet would not render the activated route.
        .set(ChildrenOutletContexts, this._injector.get(ChildrenOutletContexts)),
      onAttach: (): void => view.activate(true),
      onDetach: (): void => view.activate(false),
    });

    return view;
  }

  private installRouterEventListeners(): void {
    this._router.events
      .pipe(
        filter((event): event is RouterEvent => event instanceof RouterEvent),
        takeUntil(this._destroy$),
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

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
