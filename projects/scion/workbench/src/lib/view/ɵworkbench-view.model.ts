/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, combineLatest, Observable, pairwise} from 'rxjs';
import {ActivatedRouteSnapshot, ActivationStart, ChildrenOutletContexts, Event, Router, RouterEvent, UrlSegment} from '@angular/router';
import {ViewDragService, ViewMoveEventSource} from '../view-dnd/view-drag.service';
import {filter, map, startWith} from 'rxjs/operators';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {Disposable} from '../common/disposable';
import {throwError} from '../common/throw-error.util';
import {WorkbenchMenuItem, WorkbenchMenuItemFactoryFn} from '../workbench.model';
import {ViewId, WorkbenchView} from './workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {ComponentType} from '@angular/cdk/portal';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {AbstractType, inject, Injector, Type} from '@angular/core';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {provideViewContext} from './view-context-provider';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog';
import {Blockable} from '../glass-pane/blockable';
import {WORKBENCH_ID} from '../workbench-id';
import {ClassList} from '../common/class-list';
import {ViewState} from '../routing/routing.model';
import {RouterUtils} from '../routing/router.util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {WorkbenchSelectionService} from '../selection/workbench-selection.service';

export class ɵWorkbenchView implements WorkbenchView, Blockable {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchService = inject(ɵWorkbenchService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _router = inject(Router);
  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _childrenOutletContexts = inject(ChildrenOutletContexts);
  private readonly _partRegistry = inject(WorkbenchPartRegistry);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _workbenchDialogRegistry = inject(WorkbenchDialogRegistry);

  private readonly _menuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  private readonly _scrolledIntoView$ = new BehaviorSubject<boolean>(true);
  private readonly _adapters = new Map<Type<unknown> | AbstractType<unknown>, unknown>();
  private readonly _destroyRef = new ɵDestroyRef();

  private _activationInstant: number | undefined;
  private _closable = true;

  /**
   * Identifies the {@link MView}.
   *
   * A view handle represents a view with a particular view id. Different {@link MView}s of the same view id may share the handle.
   * For example, when changing the layout, view handles for views with the same view id will be reused, regardless of
   * whether they have the same {@link MView}.
   */
  public uid: string;
  public alternativeId: string | undefined;
  public navigationId: string | undefined;
  public navigationHint: string | undefined;
  public urlSegments: UrlSegment[] = [];
  public state: ViewState = {};
  public title: string | null = null;
  public heading: string | null = null;
  public dirty = false;
  public scrollTop = 0;
  public scrollLeft = 0;

  public readonly partId$: BehaviorSubject<string>;
  public readonly active$: BehaviorSubject<boolean>;
  public readonly menuItems$: Observable<WorkbenchMenuItem[]>;
  public readonly blockedBy$ = new BehaviorSubject<ɵWorkbenchDialog | null>(null);
  public readonly portal: WbComponentPortal;
  public readonly classList = new ClassList();

  constructor(public readonly id: ViewId, options: {component: ComponentType<ViewComponent>; layout: ɵWorkbenchLayout}) {
    this.menuItems$ = combineLatest([this._menuItemProviders$, this._workbenchService.viewMenuItemProviders$])
      .pipe(
        map(([localMenuItemProviders, globalMenuItemProviders]) => localMenuItemProviders.concat(globalMenuItemProviders)),
        mapArray(menuItemFactoryFn => menuItemFactoryFn(this)),
        filterArray((menuItem: WorkbenchMenuItem | null): menuItem is WorkbenchMenuItem => menuItem !== null),
      );

    const mView = options.layout.view({viewId: this.id});
    const mPart = options.layout.part({viewId: this.id});

    this.uid = mView.uid;
    this.alternativeId = mView.alternativeId;
    this.partId$ = new BehaviorSubject(mPart.id);
    this.active$ = new BehaviorSubject(mPart.activeViewId === this.id);
    this.portal = this.createPortal(options.component);

    this.touchOnActivate();
    this.blockWhenDialogOpened();
    this.detectRouteActivation();
  }

  private createPortal(viewComponent: ComponentType<ViewComponent>): WbComponentPortal {
    return new WbComponentPortal(viewComponent, {
      providers: [
        provideViewContext(this),
        // For each view, the workbench registers auxiliary routes of all top-level routes, enabling routing on a per-view basis.
        // But, if the workbench component itself is displayed in a router outlet, view outlets are not top-level outlets.
        // Therefore, we instruct the outlet to act as a top-level outlet to be the target of the registered top-level view routes.
        {provide: ChildrenOutletContexts, useValue: this._childrenOutletContexts},
        // Prevent injecting this part into the view because the view may be dragged to a different part.
        {provide: WorkbenchPart, useFactory: () => throwError(`[NullInjectorError] No provider for 'WorkbenchPart'`)},
        {provide: ɵWorkbenchPart, useFactory: () => throwError(`[NullInjectorError] No provider for 'ɵWorkbenchPart'`)},
      ],
    });
  }

  /**
   * Method invoked when a route is deactivated.
   */
  private onRouteDeactivate(route: ActivatedRouteSnapshot | null): void {
    this.title = null;
    this.heading = null;
    this.dirty = false;
    this.getElementInjector()?.get(WorkbenchSelectionService).deleteSelection();
    this.classList.remove({scope: 'application'});
    this.classList.remove({scope: 'navigation'});
  }

  /**
   * Method invoked when a route is about to be activated for this view.
   */
  private onRouteActivate(route: ActivatedRouteSnapshot): void {
    this.title = RouterUtils.lookupRouteData(route, WorkbenchRouteData.title) ?? null;
    this.heading = RouterUtils.lookupRouteData(route, WorkbenchRouteData.heading) ?? null;
    this.classList.set(RouterUtils.lookupRouteData(route, WorkbenchRouteData.cssClass), {scope: 'route'});
  }

  /**
   * Method invoked when the workbench layout has changed.
   *
   * This method:
   * - is called on every layout change, including changes not relevant for this view.
   * - is called after successful navigation, i.e., after {@link onRouteActivate}.
   */
  public onLayoutChange(layout: ɵWorkbenchLayout): void {
    const mPart = layout.part({viewId: this.id});
    const mView = layout.view({viewId: this.id});
    const prevNavigationId = this.navigationId;

    this.uid = mView.uid;
    this.alternativeId = mView.alternativeId;
    this.urlSegments = layout.urlSegments({viewId: this.id});
    this.navigationId = mView.navigation?.id;
    this.navigationHint = mView.navigation?.hint;
    this.state = layout.viewState({viewId: this.id});
    this.classList.set(mView.cssClass, {scope: 'layout'});
    this.classList.set(mView.navigation?.cssClass, {scope: 'navigation'});

    if (mPart.id !== this.partId$.value) {
      this.partId$.next(mPart.id);
    }

    const active = mPart.activeViewId === this.id;
    if (active !== this.active) {
      this.active$.next(active);
    }

    // Inactive views are not checked for changes since detached from the Angular component tree.
    // To complete the initialization of the routed content (to ensure that `ngOnInit` is called),
    // we manually trigger change detection.
    if (!this.active && this.portal.isConstructed && prevNavigationId !== this.navigationId) {
      this.portal.componentRef.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Returns the component of this view. Returns `null` if not navigated the view, or before it was activated for the first time.
   */
  public getComponent<T = unknown>(): T | null {
    const outletContext = RouterUtils.resolveEffectiveOutletContext(this._childrenOutletContexts.getContext(this.id));
    const outlet = outletContext?.outlet;
    return outlet?.isActivated ? outlet.component as T : null;
  }

  /**
   * Returns the injector of the component. Returns `null` if not navigated the view, or before it was activated for the first time.
   */
  public getComponentInjector(): Injector | null {
    const outletContext = RouterUtils.resolveEffectiveOutletContext(this._childrenOutletContexts.getContext(this.id));
    return outletContext?.injector ?? null;
  }

  public getElementInjector(): Injector | undefined {
    return this.portal.elementInjector;
  }

  /** @inheritDoc */
  public get first(): boolean {
    return this.position === 0;
  }

  /** @inheritDoc */
  public get last(): boolean {
    return this.position === this.part.viewIds.length - 1;
  }

  /** @inheritDoc */
  public get position(): number {
    return this.part.viewIds.indexOf(this.id);
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    this.classList.set(cssClass, {scope: 'application'});
  }

  /** @inheritDoc */
  public get cssClass(): string[] {
    return this.classList.get({scope: 'application'});
  }

  /** @inheritDoc */
  public get active(): boolean {
    return this.active$.value;
  }

  /** @inheritDoc */
  public set closable(closable: boolean) {
    this._closable = closable;
  }

  /** @inheritDoc */
  public get closable(): boolean {
    return this._closable && !this.blockedBy$.value;
  }

  /** @inheritDoc */
  public async activate(options?: {skipLocationChange?: boolean}): Promise<boolean> {
    if (this.active && this.part.active) {
      return true;
    }

    const currentLayout = this._workbenchLayoutService.layout;
    return this._workbenchRouter.navigate(
      layout => currentLayout === layout ? layout.activateView(this.id, {activatePart: true}) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: options?.skipLocationChange},
    );
  }

  /** @inheritDoc */
  public set scrolledIntoView(scrolledIntoView: boolean) {
    if (scrolledIntoView !== this._scrolledIntoView$.value) {
      this._scrolledIntoView$.next(scrolledIntoView);
    }
  }

  /** @inheritDoc */
  public get scrolledIntoView(): boolean {
    return this._scrolledIntoView$.value;
  }

  /**
   * Informs whether the tab of this view is scrolled into view in the tabbar.
   * Emits the current state upon subscription, and then continuously when the state changes.
   */
  public get scrolledIntoView$(): Observable<boolean> {
    return this._scrolledIntoView$;
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  /** @inheritDoc */
  public get part(): WorkbenchPart {
    return this._partRegistry.get(this.partId$.value);
  }

  /** @inheritDoc */
  public close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean> {
    switch (target || 'self') {
      case 'self': {
        return this._workbenchService.closeViews(this.id);
      }
      case 'all-views': {
        return this._workbenchService.closeViews(...this.part.viewIds);
      }
      case 'other-views': {
        return this._workbenchService.closeViews(...this.part.viewIds.filter(viewId => viewId !== this.id));
      }
      case 'views-to-the-right': {
        const viewIds = this.part.viewIds;
        return this._workbenchService.closeViews(...viewIds.slice(viewIds.indexOf(this.id) + 1));
      }
      case 'views-to-the-left': {
        const viewIds = this.part.viewIds;
        return this._workbenchService.closeViews(...viewIds.slice(0, viewIds.indexOf(this.id)));
      }
      default: {
        return Promise.resolve(false);
      }
    }
  }

  /** @inheritDoc */
  public move(target: 'new-window'): void;
  public move(partId: string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): void;
  public move(target: 'new-window' | string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): void {
    const source: ViewMoveEventSource = {
      workbenchId: this._workbenchId,
      partId: this.part.id,
      viewId: this.id,
      alternativeViewId: this.alternativeId,
      viewUrlSegments: this.urlSegments,
      navigationHint: this.navigationHint,
      classList: this.classList.toMap(),
    };

    if (target === 'new-window') {
      this._viewDragService.dispatchViewMoveEvent({source, target: {workbenchId: 'new-window'}});
    }
    else {
      this._viewDragService.dispatchViewMoveEvent({
        source,
        target: {
          elementId: target,
          region: options!.region,
          workbenchId: options!.workbenchId ?? this._workbenchId,
        },
      });
    }
  }

  /** @inheritDoc */
  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    const factoryFn = (): WorkbenchMenuItem => menuItem;
    this._menuItemProviders$.next(this._menuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this._menuItemProviders$.next(this._menuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }

  /**
   * Registers an adapter for this view, replacing any previously registered adapter of the same type.
   *
   * Adapters enable loosely coupled extension of an object, allowing one object to be adapted to another.
   */
  public registerAdapter<T>(adapterType: AbstractType<T> | Type<T>, object: T): void {
    this._adapters.set(adapterType, object);
  }

  /**
   * Unregisters the given adapter. Has no effect if not registered.
   */
  public unregisterAdapter(adapterType: AbstractType<unknown> | Type<unknown>): void {
    this._adapters.delete(adapterType);
  }

  /**
   * Adapts this object to the specified type. Returns `null` if no such object can be found.
   */
  public adapt<T>(adapterType: AbstractType<T> | Type<T>): T | null {
    const adapter = this._adapters.get(adapterType);
    return adapter ? adapter as T : null;
  }

  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }

  /**
   * Updates the activation instant when this view is activated.
   */
  private touchOnActivate(): void {
    this.active$
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this._activationInstant = this._activationInstantProvider.now();
      });
  }

  /**
   * Blocks this view when a dialog overlays it.
   */
  private blockWhenDialogOpened(): void {
    this._workbenchDialogRegistry.top$({viewId: this.id})
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(this.blockedBy$);
  }

  /**
   * Detects when to activate a route for this view.
   *
   * Listening for route activations on the view's router outlet is not sufficient,
   * as the outlet does not report subsequent activations of nested child routes.
   *
   * Example:
   * ```html
   * <router-outlet #router_outlet="outlet"
   *                (activate)="onActivateRoute(router_outlet.activatedRoute)">
   * </router-outlet>
   * ```
   *
   * Instead, we subscribe to Angular's `ActivationStart` router events and update the view properties accordingly.
   */
  private detectRouteActivation(): void {
    const activatedOutletRoute = this._router.routerState.root.children.find(route => route.outlet === this.id);
    const activatedChildRoute = activatedOutletRoute ? RouterUtils.resolveEffectiveRoute(activatedOutletRoute).snapshot : null;
    // The view handle is constructed at the end of the navigation (see WorkbenchUrlObserver#onNavigationEnd), i.e., after the route has been activated.
    // Therefore, we call `onRouteActivate` manually.
    if (activatedChildRoute) {
      this.onRouteActivate(activatedChildRoute);
    }

    this._router.events
      .pipe(
        filter((event: Event | RouterEvent): event is ActivationStart => event instanceof ActivationStart),
        filter(event => event.snapshot.pathFromRoot[1]?.outlet === this.id),
        map(event => event.snapshot),
        startWith(activatedChildRoute!),
        pairwise(),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
        // Only call `onRouteActivate` if the activated route has changed.
        // Otherwise, e.g., when changing matrix parameters, the view properties set by the application would be overwritten.
        if (previous?.routeConfig !== current.routeConfig) {
          this.onRouteDeactivate(previous);
          this.onRouteActivate(current);
        }
      });
  }

  public destroy(): void {
    this._destroyRef.destroy();
    this._workbenchDialogRegistry.dialogs({viewId: this.id}).forEach(dialog => dialog.destroy());
    this.portal.destroy();
  }
}

/**
 * Represents a pseudo-type for the actual {@link ViewComponent} which must not be referenced in order to avoid import cycles.
 */
type ViewComponent = any;
