/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentFactoryResolver, Injectable, Injector, OnDestroy } from '@angular/core';
import { ROUTER_OUTLET_NAME, VIEW_COMPONENT_TYPE, VIEW_REF_PREFIX, WORKBENCH } from './workbench.constants';
import { InternalWorkbenchView, WorkbenchView } from './workbench.model';
import { PortalInjector } from '@angular/cdk/portal';
import { WbComponentPortal } from './portal/wb-component-portal';
import { asapScheduler, AsyncSubject, merge, Observable, Subject } from 'rxjs';
import { delay, filter, map, take, takeUntil } from 'rxjs/operators';
import { TaskScheduler } from './task-scheduler.service';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Registry for {WorkbenchView} objects.
 */
@Injectable()
export class WorkbenchViewRegistry implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _viewRegistry = new Map<string, InternalWorkbenchView>();
  private readonly _viewRegistryChange$ = new Subject<void>();

  constructor(private _componentFactoryResolver: ComponentFactoryResolver,
              private _taskScheduler: TaskScheduler,
              private _router: Router,
              private _injector: Injector) {
  }

  /**
   * Creates a {WorkbenchView} for the given view reference and adds it to this registry.
   */
  public addViewOutlet(viewRef: string, active: boolean): void {
    this._viewRegistry.set(viewRef, this.createWorkbenchView(viewRef, active));
    this._taskScheduler.scheduleMicrotask(() => this._viewRegistryChange$.next()); // emit outside routing
  }

  /**
   * Destroys the view of the given view reference and removes it from this registry.
   */
  public removeViewOutlet(viewRef: string): void {
    this._viewRegistry.get(viewRef).portal.destroy();
    this._viewRegistry.delete(viewRef);
    this._taskScheduler.scheduleMicrotask(() => this._viewRegistryChange$.next()); // emit outside routing
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
   * Returns the view for the specified 'viewRef', or throws an Error if not found.
   */
  public getElseThrow(viewRef: string): InternalWorkbenchView {
    const view = this._viewRegistry.get(viewRef);
    if (!view) {
      throw Error(`[IllegalStateError] view '${viewRef}' not contained in the view registry`);
    }
    return view;
  }

  /**
   * Returns the view for the specified 'viewRef', or 'null' if not found.
   */
  public getElseNull(viewRef: string): InternalWorkbenchView | null {
    return this._viewRegistry.get(viewRef) || null;
  }

  public get viewRefs(): string[] {
    return Array.from(this._viewRegistry.keys());
  }

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public get viewRefs$(): Observable<string[]> {
    return merge(this._viewRegistryChange$, this.initialNavigationNotifier$).pipe(map(() => this.viewRefs));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private createWorkbenchView(viewRef: string, active: boolean): InternalWorkbenchView {
    const portal = new WbComponentPortal(this._componentFactoryResolver, this._injector.get(VIEW_COMPONENT_TYPE));
    const view = new InternalWorkbenchView(viewRef, active, this._injector.get(WORKBENCH), portal);

    const injectionTokens = new WeakMap();
    injectionTokens.set(ROUTER_OUTLET_NAME, viewRef);
    injectionTokens.set(WorkbenchView, view);
    injectionTokens.set(InternalWorkbenchView, view);

    // We must not use the root injector as parent injector of the portal component element injector.
    // Otherwise, if tokens of the root injector are masked or extended in lazily loaded modules, they would not be resolved.
    //
    // This is by design of Angular injection token resolution rules of not checking module injectors when checking the element hierarchy for a token.
    // See function `resolveDep` in Angular file `provider.ts`.
    //
    // Instead, we use a {NullInjector} which further acts as a barrier to not resolve workbench internal tokens declared somewhere in the element hierarchy.
    const injector = new PortalInjector(Injector.NULL, injectionTokens);

    portal.init({
      injector: injector,
      onActivate: (): void => view.activate(true),
      onDeactivate: (): void => view.activate(false),
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
