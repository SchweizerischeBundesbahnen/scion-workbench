/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentFactoryResolver, Injectable, Injector, OnDestroy } from '@angular/core';
import { ROUTER_OUTLET_NAME, VIEW_COMPONENT_TYPE, VIEW_REF_PREFIX, WORKBENCH } from '../workbench.constants';
import { InternalWorkbenchView, WorkbenchView } from '../workbench.model';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { asapScheduler, AsyncSubject, merge, Observable, Subject } from 'rxjs';
import { delay, filter, map, take, takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { ViewActivationInstantProvider } from '../view-activation-instant-provider.service';
import { ViewDragService } from '../view-dnd/view-drag.service';
import { WorkbenchViewPartRegistry } from '../view-part/workbench-view-part.registry';
import { WorkbenchLayoutService } from '../workbench-layout.service';

/**
 * Registry for {WorkbenchView} objects.
 */
@Injectable()
export class WorkbenchViewRegistry implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _viewRegistry = new Map<string, InternalWorkbenchView>();
  private readonly _viewRegistryChange$ = new Subject<void>();

  constructor(private _componentFactoryResolver: ComponentFactoryResolver,
              private _router: Router,
              private _injector: Injector,
              private _viewActivationInstantProvider: ViewActivationInstantProvider,
              private _viewDragService: ViewDragService,
              private _layoutService: WorkbenchLayoutService) {
  }

  /**
   * Creates a {WorkbenchView} for the given view reference and adds it to this registry.
   */
  public addViewOutlet(viewId: string, active: boolean): void {
    this._viewRegistry.set(viewId, this.createWorkbenchView(viewId, active));
    asapScheduler.schedule(() => this._viewRegistryChange$.next()); // emit outside routing
  }

  /**
   * Destroys the view of the given view reference and removes it from this registry.
   */
  public removeViewOutlet(viewId: string): void {
    this._viewRegistry.get(viewId).portal.destroy();
    this._viewRegistry.delete(viewId);
    asapScheduler.schedule(() => this._viewRegistryChange$.next()); // emit outside routing
  }

  /**
   * Computes a view outlet identity which is unique in this application.
   */
  public computeNextViewOutletIdentity(): string {
    let i = this._viewRegistry.size + 1;
    for (; this._viewRegistry.has(VIEW_REF_PREFIX + i); i++) {
    }
    return VIEW_REF_PREFIX + i;
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity, or throws an Error if not found.
   */
  public getElseThrow(viewId: string): InternalWorkbenchView {
    const view = this._viewRegistry.get(viewId);
    if (!view) {
      throw Error(`[NullViewError] View '${viewId}' not found in the registry.`);
    }
    return view;
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity, or returns `null` if not found.
   */
  public getElseNull(viewId: string): InternalWorkbenchView | null {
    return this._viewRegistry.get(viewId) || null;
  }

  public get viewIds(): string[] {
    return Array.from(this._viewRegistry.keys());
  }

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public get viewIds$(): Observable<string[]> {
    return merge(this._viewRegistryChange$, this.initialNavigationNotifier$).pipe(map(() => this.viewIds));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private createWorkbenchView(viewId: string, active: boolean): InternalWorkbenchView {
    const portal = new WbComponentPortal(this._componentFactoryResolver, this._injector.get(VIEW_COMPONENT_TYPE));
    const view = new InternalWorkbenchView(viewId, active, portal, this._injector.get(WORKBENCH), this._viewActivationInstantProvider, this._router, this._viewDragService, this._injector.get(WorkbenchViewPartRegistry), this._layoutService);

    portal.init({
      injectorTokens: new WeakMap()
        .set(ROUTER_OUTLET_NAME, viewId)
        .set(WorkbenchView, view)
        .set(InternalWorkbenchView, view),
      onAttach: (): void => view.activate(true),
      onDetach: (): void => view.activate(false),
    });

    return view;
  }

  /**
   * Returns an Observable that emits once the initial navigation is performed, and then completes.
   *
   * When subscribing after the initial navigation is performed, the Observable emits and completes immediately.
   */
  private get initialNavigationNotifier$(): AsyncSubject<void> {
    const notifier$ = new AsyncSubject<void>();
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        delay(0, asapScheduler), // emit outside routing
        take(1),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        notifier$.next();
        notifier$.complete();
      });
    return notifier$;
  }
}
