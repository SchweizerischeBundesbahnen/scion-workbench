/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {ActivatedRouteSnapshot, ChildrenOutletContexts, OutletContext, UrlSegment} from '@angular/router';
import {ViewDragService, ViewMoveEventSource} from '../view-dnd/view-drag.service';
import {map} from 'rxjs/operators';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {Disposable} from '../common/disposable';
import {throwError} from '../common/throw-error.util';
import {WorkbenchMenuItem, WorkbenchMenuItemFactoryFn} from '../workbench.model';
import {ViewId, WorkbenchView} from './workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {ComponentType} from '@angular/cdk/portal';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {AbstractType, assertNotInReactiveContext, computed, effect, EnvironmentInjector, inject, Injector, Signal, signal, Type, untracked} from '@angular/core';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {WORKBENCH_PART_REGISTRY} from '../part/workbench-part.registry';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {provideViewContext} from './view-context-provider';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog';
import {Blockable} from '../glass-pane/blockable';
import {WORKBENCH_ID} from '../workbench-id';
import {ClassList} from '../common/class-list';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {Routing} from '../routing/routing.util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';

export class ɵWorkbenchView implements WorkbenchView, Blockable {

  private readonly _viewEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchService = inject(ɵWorkbenchService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _childrenOutletContexts = inject(ChildrenOutletContexts);
  private readonly _partRegistry = inject(WORKBENCH_PART_REGISTRY);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _workbenchDialogRegistry = inject(WorkbenchDialogRegistry);

  private readonly _menuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  private readonly _adapters = new Map<Type<unknown> | AbstractType<unknown>, unknown>();

  private readonly _title = signal<string | null>(null);
  private readonly _heading = signal<string | null>(null);
  private readonly _dirty = signal(false);
  private readonly _closable = signal(true);
  private readonly _closableComputed = computed(() => this._closable() && !this._blockedBy());
  private readonly _blockedBy = toSignal(inject(WorkbenchDialogRegistry).top$({viewId: this.id}), {requireSync: true});
  private readonly _scrolledIntoView = signal(true);

  private _activationInstant: number | undefined;

  /**
   * Identifies the {@link MView}.
   *
   * A view handle represents a view with a particular view id. Different {@link MView}s of the same view id may share the handle.
   * For example, when changing the layout, view handles for views with the same view id will be reused, regardless of
   * whether they have the same {@link MView}.
   */
  public uid!: string;
  public alternativeId: string | undefined;
  public navigationId: string | undefined;
  public navigationHint = signal<string | undefined>(undefined);
  public navigationData = signal<NavigationData>({});
  public navigationState = signal<NavigationState>({});
  public urlSegments = signal<UrlSegment[]>([], {equal: (a, b) => a.join('/') === b.join('/')});
  public position = computed(() => this.part().viewIds().indexOf(this.id));
  public first = computed(() => this.position() === 0);
  public last = computed(() => this.position() === this.part().viewIds().length - 1);

  public readonly part = signal<ɵWorkbenchPart>(null!);
  public readonly active = signal<boolean>(false);
  public readonly menuItems$: Observable<WorkbenchMenuItem[]>;
  public readonly blockedBy$ = toObservable<ɵWorkbenchDialog | null>(this._blockedBy);
  public readonly portal: WbComponentPortal;
  public readonly classList = new ClassList();

  constructor(public readonly id: ViewId, options: {component: ComponentType<ViewComponent>}) {
    this.menuItems$ = combineLatest([this._menuItemProviders$, this._workbenchService.viewMenuItemProviders$])
      .pipe(
        map(([localMenuItemProviders, globalMenuItemProviders]) => localMenuItemProviders.concat(globalMenuItemProviders)),
        mapArray(menuItemFactoryFn => menuItemFactoryFn(this)),
        filterArray((menuItem: WorkbenchMenuItem | null): menuItem is WorkbenchMenuItem => menuItem !== null),
      );

    this.portal = this.createPortal(options.component);
    this.touchOnActivate();
    this.installModelUpdater();
    this.onLayoutChange({layout: this._workbenchRouter.getCurrentNavigationContext().layout});
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
   * Method invoked when the workbench layout has changed.
   *
   * This method:
   * - is called on every layout change, including changes not relevant for this view, e.g., to update the view's part.
   * - is called after destroyed the previous component (if any), but before constructing the new component.
   */
  private onLayoutChange(change: {layout: ɵWorkbenchLayout; previousRoute?: ActivatedRouteSnapshot | null; route?: ActivatedRouteSnapshot}): void {
    const {layout, route, previousRoute} = change;

    const mPart = layout.part({viewId: this.id});
    const mView = layout.view({viewId: this.id});

    this.part.set(this._partRegistry.get(mPart.id));
    this.active.set(mPart.activeViewId === this.id);
    this.urlSegments.set(layout.urlSegments({viewId: this.id}));

    this.uid = mView.uid;
    this.alternativeId = mView.alternativeId;
    this.classList.layout = mView.cssClass;

    // Test if a new route has been activated for this view.
    const routeChanged = route?.routeConfig !== previousRoute?.routeConfig;
    if (routeChanged) {
      this.title = Routing.lookupRouteData(route!, WorkbenchRouteData.title) ?? null;
      this.heading = Routing.lookupRouteData(route!, WorkbenchRouteData.heading) ?? null;
      this.dirty = false;
      this.classList.route = Routing.lookupRouteData(route!, WorkbenchRouteData.cssClass);
      this.classList.application = [];
    }

    // Test if this view was navigated. Navigation does not necessarily cause the route to change.
    const navigationChanged = mView.navigation?.id !== this.navigationId;
    if (navigationChanged) {
      this.navigationId = mView.navigation?.id;
      this.classList.navigation = mView.navigation?.cssClass;
      this.navigationHint.set(mView.navigation?.hint);
      this.navigationData.set(mView.navigation?.data ?? {});
      this.navigationState.set(layout.navigationState({viewId: this.id}));
    }

    // If this view is inactive, Angular does not check it for changes as it is detached from the Angular component tree.
    // To complete the initialization of the routed component (to ensure that `ngOnInit` is called), we manually trigger change
    // detection. We cannot perform change detection right now because the routed component has not been activated/constructed yet.
    // Use case: Navigating an (existing) inactive view to another route.
    if (!this.active() && this.portal.isConstructed && routeChanged) {
      this._workbenchRouter.getCurrentNavigationContext().registerPostNavigationAction(() => this.portal.componentRef.changeDetectorRef.detectChanges());
    }
  }

  /**
   * Returns the component of this view. Returns `null` if not navigated the view, or before it was activated for the first time.
   */
  public getComponent<T = unknown>(): T | null {
    const outlet = this.getOutletContext()?.outlet;
    return outlet?.isActivated ? outlet.component as T : null;
  }

  /**
   * Returns the injector of the component. Returns `null` if not navigated the view, or before it was activated for the first time.
   */
  public getComponentInjector(): Injector | null {
    return this.getOutletContext()?.injector ?? null;
  }

  /** @inheritDoc */
  public get title(): Signal<string | null> {
    return this._title;
  }

  /** @inheritDoc */
  public set title(title: string | null) {
    untracked(() => this._title.set(title));
  }

  /** @inheritDoc */
  public get heading(): Signal<string | null> {
    return this._heading;
  }

  /** @inheritDoc */
  public set heading(heading: string | null) {
    untracked(() => this._heading.set(heading));
  }

  /** @inheritDoc */
  public get dirty(): Signal<boolean> {
    return this._dirty;
  }

  /** @inheritDoc */
  public set dirty(dirty: boolean) {
    untracked(() => this._dirty.set(dirty));
  }

  /** @inheritDoc */
  public get scrolledIntoView(): Signal<boolean> {
    return this._scrolledIntoView;
  }

  public set scrolledIntoView(scrolledIntoView: boolean) {
    this._scrolledIntoView.set(scrolledIntoView);
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    untracked(() => this.classList.application = cssClass);
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this.classList.application;
  }

  /** @inheritDoc */
  public set closable(closable: boolean) {
    untracked(() => this._closable.set(closable));
  }

  /** @inheritDoc */
  public get closable(): Signal<boolean> {
    return this._closableComputed;
  }

  /** @inheritDoc */
  public async activate(options?: {skipLocationChange?: boolean}): Promise<boolean> {
    assertNotInReactiveContext(this.activate, 'Call WorkbenchView.activate() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    if (this.active() && this.part().active()) {
      return true;
    }

    const currentLayout = this._workbenchLayoutService.layout();
    return this._workbenchRouter.navigate(
      layout => currentLayout === layout ? layout.activateView(this.id, {activatePart: true}) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: options?.skipLocationChange},
    );
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  /** @inheritDoc */
  public close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean> {
    assertNotInReactiveContext(this.close, 'Call WorkbenchView.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    switch (target || 'self') {
      case 'self': {
        return this._workbenchService.closeViews(this.id);
      }
      case 'all-views': {
        return this._workbenchService.closeViews(...this.part().viewIds());
      }
      case 'other-views': {
        return this._workbenchService.closeViews(...this.part().viewIds().filter(viewId => viewId !== this.id));
      }
      case 'views-to-the-right': {
        const viewIds = this.part().viewIds();
        return this._workbenchService.closeViews(...viewIds.slice(viewIds.indexOf(this.id) + 1));
      }
      case 'views-to-the-left': {
        const viewIds = this.part().viewIds();
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
    assertNotInReactiveContext(this.move, 'Call WorkbenchView.move() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    const source: ViewMoveEventSource = {
      workbenchId: this._workbenchId,
      partId: this.part().id,
      viewId: this.id,
      alternativeViewId: this.alternativeId,
      viewUrlSegments: this.urlSegments(),
      navigationHint: this.navigationHint(),
      navigationData: this.navigationData(),
      classList: this.classList.asMap(),
    };

    if (target === 'new-window') {
      this._viewDragService.dispatchViewMoveEvent({source, target: {workbenchId: 'new-window'}});
    }
    else {
      this._viewDragService.dispatchViewMoveEvent({
        source,
        target: {
          elementId: target,
          region: options?.region,
          workbenchId: options?.workbenchId ?? this._workbenchId,
        },
      });
    }
  }

  /** @inheritDoc */
  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    assertNotInReactiveContext(this.registerMenuItem, 'Call WorkbenchView.registerMenuItem() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    const factoryFn = (): WorkbenchMenuItem => menuItem;
    this._menuItemProviders$.next(this._menuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this._menuItemProviders$.next(this._menuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }

  /**
   * Reference to the handle's injector. The injector will be destroyed when closing the view.
   */
  public get injector(): Injector {
    return this._viewEnvironmentInjector;
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

  /** @inheritDoc */
  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }

  /**
   * Returns the outlet context of the currently activated route.
   */
  private getOutletContext(): OutletContext | null {
    return Routing.resolveEffectiveOutletContext(this._childrenOutletContexts.getContext(this.id));
  }

  /**
   * Updates the activation instant when this view is activated.
   */
  private touchOnActivate(): void {
    effect(() => {
      if (this.active()) {
        this._activationInstant = this._activationInstantProvider.now();
      }
    });
  }

  /**
   * Sets up automatic synchronization of {@link WorkbenchView} on every layout change.
   *
   * If the operation is cancelled (e.g., due to a navigation failure), it reverts the changes.
   */
  private installModelUpdater(): void {
    Routing.activatedRoute$(this.id, {emitOn: 'always'})
      .pipe(takeUntilDestroyed())
      .subscribe(([previousRoute, route]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
        const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
        const {layout, previousLayout, layoutDiff} = navigationContext;

        if (layoutDiff.removedViews.includes(this.id)) {
          return;
        }

        this.onLayoutChange({layout, route, previousRoute});

        // Revert change in case the navigation fails.
        if (previousLayout?.hasView(this.id)) {
          navigationContext.registerUndoAction(() => this.onLayoutChange({layout: previousLayout}));
        }
      });
  }

  public destroy(): void {
    this._viewEnvironmentInjector.destroy();
    this._workbenchDialogRegistry.dialogs({viewId: this.id}).forEach(dialog => dialog.destroy());
    this.portal.destroy();
  }
}

/**
 * Represents a pseudo-type for the actual {@link ViewComponent} which must not be referenced in order to avoid import cycles.
 */
type ViewComponent = any;
