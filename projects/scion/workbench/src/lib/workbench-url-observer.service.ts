/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { GuardsCheckEnd, NavigationEnd, NavigationStart, Route, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Injectable, IterableDiffers, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewOutletDiffer } from './routing/view-outlet-differ';
import { WorkbenchAuxiliaryRoutesRegistrator } from './routing/workbench-auxiliary-routes-registrator.service';
import { VIEW_GRID_QUERY_PARAM } from './workbench.constants';
import { ViewPartGridSerializerService } from './view-part-grid/view-part-grid-serializer.service';
import { WorkbenchViewRegistry } from './workbench-view-registry.service';
import { WorkbenchViewPartRegistry } from './view-part-grid/workbench-view-part-registry.service';
import { ViewPartGrid } from './view-part-grid/view-part-grid.model';

/**
 * Observes the application URL to update view and viewpart registries, and to dynamically register Angular auxiliary routes for views.
 *
 * When a new view outlet is detected in the URL, all primary routes are registered with that routing outlet as auxiliary routes.
 * When a view router outlet is removed, all associated auxiliary routes are discarded.
 */
@Injectable()
export class WorkbenchUrlObserver implements OnDestroy {

  private _destroy$ = new Subject<void>();

  private _undoRouteRegistrationFn: () => void;

  constructor(private _router: Router,
              private _auxRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _viewPartGridSerializer: ViewPartGridSerializerService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              differs: IterableDiffers) {
    this.installNavigationStartRoutingListener(differs);
    this.installGuardsCheckEndRoutingListener(differs);
    this.installNavigationEndRoutingListener(differs);
  }

  /**
   * Checks for new view router outlets in the URL, and if so, registers an auxiliary route for every primary route.
   * However, if navigation is rejected due to routing guards, those auxiliary routes must be undone.
   */
  private onNavigationStart(routerEvent: NavigationStart, differ: ViewOutletDiffer): void {
    this._undoRouteRegistrationFn = null;

    const viewOutletChanges = differ.diff(routerEvent.url);
    if (viewOutletChanges) {
      // Register auxiliary routes for added view outlets.
      const viewRefs: string[] = [];
      viewOutletChanges.forEachAddedItem(({item}) => viewRefs.push(item));
      const newAuxiliaryRoutes = this._auxRoutesRegistrator.registerViewAuxiliaryRoutes(...viewRefs);

      // Prepare undo action in case navigation is rejected, e.g. by routing guard.
      this._undoRouteRegistrationFn = (): void => {
        differ.diff(this._router.url); // undo stateful differ
        this._auxRoutesRegistrator.replaceRouterConfig(this._router.config.filter(route => !newAuxiliaryRoutes.includes(route)));
      };
    }
  }

  /**
   * Checks for removed view router outlets in the URL, and if so, discards associated auxiliary routes.
   * Also, if navigation is rejected, undo registration of auxiliary routes as registered in `onNavigationStart`.
   */
  private onGuardsCheckEnd(routerEvent: GuardsCheckEnd, differ: ViewOutletDiffer): void {
    // Undo route registration if rejected.
    if (!routerEvent.shouldActivate) {
      this._undoRouteRegistrationFn && this._undoRouteRegistrationFn();
      this._undoRouteRegistrationFn = null;
      return;
    }

    // Discard routes of closed views.
    const viewOutletChanges = differ.diff(routerEvent.url);
    if (viewOutletChanges) {
      const routes = this._router.config;
      const discardedRoutes: Route[] = [];

      viewOutletChanges.forEachRemovedItem(({item}) => {
        discardedRoutes.push(...routes.filter(route => route.outlet === item));
      });

      if (discardedRoutes.length > 0) {
        this._auxRoutesRegistrator.replaceRouterConfig(routes.filter(route => !discardedRoutes.includes(route)));
      }
    }
  }

  private onNavigationEnd(routerEvent: NavigationEnd, differ: ViewOutletDiffer): void {
    // Update viewpart registry.
    const serializedViewPartGrid = this._router.parseUrl(routerEvent.url).queryParamMap.get(VIEW_GRID_QUERY_PARAM);
    const viewPartGrid = new ViewPartGrid(serializedViewPartGrid, this._viewPartGridSerializer);

    // Update view registry.
    const viewOutletChanges = differ.diff(routerEvent.url);
    if (viewOutletChanges) {
      viewOutletChanges.forEachAddedItem(({item}) => {
        this._viewRegistry.addViewOutlet(item, viewPartGrid.isViewActive(item));
      });
      viewOutletChanges.forEachRemovedItem(({item}) => {
        this._viewRegistry.removeViewOutlet(item);
      });
    }
    this._viewPartRegistry.setGrid(viewPartGrid);
  }

  /**
   * Delegates `NavigationStart` events to `onNavigationStart` method.
   */
  private installNavigationStartRoutingListener(differs: IterableDiffers): void {
    const outletDiffer = new ViewOutletDiffer(differs, this._router);
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        takeUntil(this._destroy$),
      )
      .subscribe((routerEvent: NavigationStart) => {
        this.onNavigationStart(routerEvent, outletDiffer);
      });
  }

  /**
   * Delegates `GuardsCheckEnd` events to `onGuardsCheckEnd` method.
   */
  private installGuardsCheckEndRoutingListener(differs: IterableDiffers): void {
    const outletDiffer = new ViewOutletDiffer(differs, this._router);
    this._router.events
      .pipe(
        filter(event => event instanceof GuardsCheckEnd),
        takeUntil(this._destroy$),
      )
      .subscribe((routerEvent: GuardsCheckEnd) => {
        this.onGuardsCheckEnd(routerEvent, outletDiffer);
      });
  }

  /**
   * Delegates `NavigationEnd` events to `onNavigationEnd` method.
   */
  private installNavigationEndRoutingListener(differs: IterableDiffers): void {
    const outletDiffer = new ViewOutletDiffer(differs, this._router);
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroy$),
      )
      .subscribe((routerEvent: NavigationEnd) => {
        this.onNavigationEnd(routerEvent, outletDiffer);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
