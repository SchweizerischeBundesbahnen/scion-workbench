/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {assertNotInReactiveContext, computed, effect, EnvironmentInjector, inject, Injector, runInInjectionContext, Signal, signal, untracked} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPartAction} from '../workbench.model';
import {PartId, WorkbenchPart, WorkbenchPartNavigation} from './workbench-part.model';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ViewId} from '../view/workbench-view.model';
import {ActivatedRouteSnapshot, ChildrenOutletContexts} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {WORKBENCH_PART_ACTION_REGISTRY} from './workbench-part-action.registry';
import {ClassList} from '../common/class-list';
import {Routing} from '../routing/routing.util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';

export class ɵWorkbenchPart implements WorkbenchPart {

  private readonly _partEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _rootOutletContexts = inject(ChildrenOutletContexts);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _partActionRegistry = inject(WORKBENCH_PART_ACTION_REGISTRY);
  private readonly _partComponent: ComponentType<PartComponent | MainAreaPartComponent>;

  public readonly alternativeId: string | undefined;
  public readonly navigation = signal<WorkbenchPartNavigation | undefined>(undefined);
  public readonly active = signal(false);
  public readonly viewIds = signal<ViewId[]>([], {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: true})});
  public readonly activeViewId = signal<ViewId | null>(null);
  public readonly actions: Signal<WorkbenchPartAction[]>;
  public readonly classList = new ClassList();

  private _isInMainArea: boolean | undefined;
  private _activationInstant: number | undefined;

  constructor(public readonly id: PartId, layout: ɵWorkbenchLayout, options: {component: ComponentType<PartComponent | MainAreaPartComponent>}) {
    this.alternativeId = layout.part({partId: this.id}).alternativeId;
    this._partComponent = options.component;
    this.actions = this.findPartActions();
    this.touchOnActivate();
    this.installModelUpdater();
    this.onLayoutChange({layout});
  }

  /**
   * Constructs the portal using the given injection context.
   */
  public createPortalFromInjectionContext(injectionContext: Injector): ComponentPortal<PartComponent | MainAreaPartComponent> {
    const injector = Injector.create({
      parent: injectionContext,
      providers: [
        {provide: ɵWorkbenchPart, useValue: this},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
      ],
    });
    return new ComponentPortal(this._partComponent, null, injector, null, null);
  }

  /**
   * Method invoked when the workbench layout has changed.
   *
   * This method:
   * - is called on every layout change, enabling the update of part properties defined in the layout (navigation hint, navigation data, ...).
   * - is called on route activation (after destroyed the previous component (if any), but before constructing the new component).
   */
  private onLayoutChange(change: {layout: ɵWorkbenchLayout; route?: ActivatedRouteSnapshot; previousRoute?: ActivatedRouteSnapshot | null}): void {
    const {layout, route, previousRoute} = change;

    this._isInMainArea ??= layout.hasPart(this.id, {grid: 'mainArea'});
    const mPart = layout.part({partId: this.id});
    const active = layout.activePart({grid: this._isInMainArea ? 'mainArea' : 'workbench'})?.id === this.id;
    this.active.set(active);
    this.viewIds.set(mPart.views.map(view => view.id));
    this.activeViewId.set(mPart.activeViewId ?? null);

    // Test if a new route has been activated for this part.
    const routeChanged = route && route.routeConfig !== previousRoute?.routeConfig;
    if (routeChanged) {
      this.classList.route = Routing.lookupRouteData(route, WorkbenchRouteData.cssClass);
      this.classList.application = [];
    }

    // Test if this part was navigated. Navigation does not necessarily cause the route to change.
    const navigationChanged = mPart.navigation?.id !== this.navigation()?.id;
    if (navigationChanged) {
      this.navigation.set(mPart.navigation && {
        id: mPart.navigation.id,
        hint: mPart.navigation.hint,
        data: mPart.navigation.data,
        state: layout.navigationState({outlet: this.id}),
        path: layout.urlSegments({outlet: this.id}),
      });
      this.classList.navigation = mPart.navigation?.cssClass;
    }
  }

  /**
   * Returns the component of this part. Returns `null` if not displaying navigated content.
   */
  public getComponent<T = unknown>(): T | null {
    const outlet = Routing.resolveEffectiveOutletContext(this._rootOutletContexts.getContext(this.id))?.outlet;
    return outlet?.isActivated ? outlet.component as T : null;
  }

  /**
   * Activates this part.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activate(): Promise<boolean> {
    assertNotInReactiveContext(this.activate, 'Call WorkbenchPart.activate() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    if (this.active()) {
      return true;
    }

    const currentLayout = this._workbenchLayoutService.layout();
    return this._workbenchRouter.navigate(
      layout => currentLayout === layout ? layout.activatePart(this.id) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: true}, // do not add part activation into browser history stack
    );
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  public get isInMainArea(): boolean {
    return this._isInMainArea ?? false;
  }

  /**
   * Reference to the handle's injector. The injector will be destroyed when removing the part.
   */
  public get injector(): Injector {
    return this._partEnvironmentInjector;
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    untracked(() => this.classList.application = cssClass);
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this.classList.application;
  }

  /**
   * Finds actions matching this part.
   */
  private findPartActions(): Signal<WorkbenchPartAction[]> {
    const injector = Injector.create({
      parent: inject(Injector),
      providers: [
        {provide: ɵWorkbenchPart, useValue: this},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
      ],
    });

    return computed(() => {
      // Filter actions by calling `canMatch`, if any.
      return this._partActionRegistry.objects().filter(action => {
        // - Run function in injection context for `canMatch` function to inject dependencies.
        // - Run function in a reactive context to track signals.
        return runInInjectionContext(injector, () => action.canMatch?.(this) ?? true);
      });
    });
  }

  /**
   * Updates the activation instant when this part is activated.
   */
  private touchOnActivate(): void {
    effect(() => {
      if (this.active()) {
        this._activationInstant = this._activationInstantProvider.now();
      }
    });
  }

  /**
   * Sets up automatic synchronization of {@link WorkbenchPart} on every layout change.
   *
   * If the operation is cancelled (e.g., due to a navigation failure), it reverts the changes.
   */
  private installModelUpdater(): void {
    Routing.activatedRoute$(this.id, {emitOn: 'always'})
      .pipe(takeUntilDestroyed())
      .subscribe(([previousRoute, route]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
        const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
        const {layout, previousLayout, layoutDiff} = navigationContext;

        if (layoutDiff.removedParts.includes(this.id)) {
          return;
        }

        this.onLayoutChange({layout, route, previousRoute});

        // Revert change in case the navigation fails.
        if (previousLayout?.hasPart(this.id)) {
          navigationContext.registerUndoAction(() => this.onLayoutChange({layout: previousLayout, route: previousRoute!, previousRoute: route}));
        }
      });
  }

  public destroy(): void {
    this._partEnvironmentInjector.destroy();
    // IMPORTANT: Only detach the active view, not destroy it, because views are explicitly destroyed when view handles are removed.
    // Otherwise, moving the last view to another part would fail because the view would already be destroyed.
    if (this.activeViewId()) {
      this._viewRegistry.get(this.activeViewId()!, {orElse: null})?.portal.detach();
    }
  }
}

/**
 * Represents a pseudo-type for the actual {@link PartComponent} which must not be referenced in order to avoid import cycles.
 */
type PartComponent = any;

/**
 * Represents a pseudo-type for the actual {@link MainAreaPartComponent} which must not be referenced in order to avoid import cycles.
 */
type MainAreaPartComponent = any;
