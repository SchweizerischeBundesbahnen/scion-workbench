/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {assertNotInReactiveContext, computed, effect, EnvironmentInjector, inject, Injector, IterableDiffers, runInInjectionContext, Signal, signal, TemplateRef, untracked, WritableSignal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPartAction, WorkbenchPartActionFn} from '../workbench.model';
import {PartId, WorkbenchPart, WorkbenchPartNavigation} from './workbench-part.model';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {ComponentType} from '@angular/cdk/portal';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ActivatedRouteSnapshot, ChildrenOutletContexts} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {WORKBENCH_PART_ACTION_REGISTRY} from './workbench-part-action.registry';
import {ClassList} from '../common/class-list';
import {Routing} from '../routing/routing.util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {MPart, MTreeNode, WorkbenchGrids} from '../layout/workbench-grid.model';
import {MActivity} from '../activity/workbench-activity.model';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {PartSlotComponent} from './part-content/part-slot.component';
import {MAIN_AREA} from '../layout/workbench-layout';
import {MainAreaPartComponent} from './main-area-part/main-area-part.component';
import {PartComponent} from './part.component';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';

export class ɵWorkbenchPart implements WorkbenchPart {

  private readonly _partEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _rootOutletContexts = inject(ChildrenOutletContexts);
  private readonly _layout = inject(WorkbenchLayoutService).layout;
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _title = signal<string | undefined>(undefined);
  private readonly _titleComputed = this.computeTitle();

  public readonly alternativeId: string | undefined;
  public readonly navigation = signal<WorkbenchPartNavigation | undefined>(undefined);
  public readonly active = signal(false);
  public readonly viewIds = computed(() => this.views().map(view => view.id));
  public readonly activeViewId = computed(() => this.activeView()?.id ?? null);
  public readonly mPart: WritableSignal<MPart>;
  public readonly gridName: WritableSignal<keyof WorkbenchGrids>;
  public readonly peripheral = signal(false);
  public readonly referencePart = signal(false);
  public readonly topLeft = signal(false);
  public readonly topRight = signal(false);
  public readonly activity = signal<MActivity | null>(null);
  public readonly canMinimize = computed(() => this.activity() !== null && this.topRight());
  public readonly actions: Signal<WorkbenchPartAction[]>;
  public readonly activeView: Signal<ɵWorkbenchView | null>;
  public readonly views: Signal<ɵWorkbenchView[]>;
  public readonly classList = new ClassList();
  public readonly portal: WbComponentPortal<MainAreaPartComponent | PartComponent>;
  public readonly slot: {portal: WbComponentPortal<PartSlotComponent>};

  private _isInMainArea: boolean | undefined;
  private _activationInstant: number | undefined;

  constructor(public readonly id: PartId, layout: ɵWorkbenchLayout) {
    this.mPart = signal(layout.part({partId: id}));
    this.gridName = signal(layout.grid({partId: id}).gridName);
    this.actions = computePartActions(this);
    this.activeView = computeActiveView(this.mPart);
    this.views = computeViews(this.mPart);
    this.alternativeId = this.mPart().alternativeId;
    this.portal = this.createPortal<MainAreaPartComponent | PartComponent>(id === MAIN_AREA ? MainAreaPartComponent : PartComponent);
    this.slot = {portal: this.createPortal(PartSlotComponent)};
    this.touchOnActivate();
    this.installModelUpdater();
    this.onLayoutChange({layout});
  }

  private createPortal<T>(componentType: ComponentType<T>): WbComponentPortal<T> {
    return new WbComponentPortal<T>(componentType, {
      providers: [
        {provide: ɵWorkbenchPart, useValue: this},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
      ],
    });
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
    const {gridName, grid} = layout.grid({partId: this.id});
    this.mPart.set(mPart);
    this.gridName.set(gridName);
    this.peripheral.set(layout.isPeripheralPart(this.id));
    this.referencePart.set(grid.referencePartId === this.id);
    this.active.set(isActive(this.id, layout));
    this.activity.set(layout.activity({partId: this.id}, {orElse: null}));
    this.topLeft.set(isTopLeft(grid.root, mPart));
    this.topRight.set(isTopRight(grid.root, mPart));
    this.classList.layout = mPart.cssClass;

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

  private computeTitle(): Signal<string | undefined> {
    return computed(() => {
      const activity = this.activity();

      // If this part is not contained in an activity, return the title from the handle or layout.
      if (!activity) {
        return this._title() ?? this._layout().part({partId: this.id}).title;
      }

      // Compute the title based on the activity's reference part if this part is the top-leftmost part.
      if (this.topLeft()) {
        const referencePartId = this._layout().grids[activity.id]!.referencePartId!;
        return this._layout().part({partId: referencePartId, grid: activity.id}).title;
      }

      // If this part is the reference part but not positioned top-leftmost, only return the handle's title, not the activity title set on the layout.
      if (this.referencePart()) {
        return this._title();
      }

      // Default to the title set on the handle or defined on the layout.
      return this._title() ?? this._layout().part({partId: this.id}).title;
    });
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

    const currentLayout = this._layout();
    return this._workbenchRouter.navigate(
      layout => currentLayout === layout ? layout.activatePart(this.id) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: true}, // do not add part activation into browser session history stack
    );
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  /** @inheritDoc */
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
  public get title(): Signal<string | undefined> {
    return this._titleComputed;
  }

  /** @inheritDoc */
  public set title(title: string | undefined) {
    untracked(() => this._title.set(title));
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
  }
}

/**
 * Computes if this part is the top-leftmost part.
 */
function isTopLeft(element: MTreeNode | MPart, testee: MPart): boolean {
  if (element instanceof MPart) {
    return element.id === testee.id;
  }

  const {child1, child2} = element;
  return isTopLeft(child1.visible ? child1 : child2, testee);
}

/**
 * Computes if this part is the top-rightmost part.
 */
function isTopRight(element: MTreeNode | MPart, testee: MPart): boolean {
  if (element instanceof MPart) {
    return element.id === testee.id;
  }

  const {child1, child2} = element;
  if (child1.visible && child2.visible) {
    return element.direction === 'column' ? isTopRight(child1, testee) : isTopRight(child2, testee);
  }
  return isTopRight(child1.visible ? child1 : child2, testee);
}

/**
 * Computes if the given part is active.
 *
 * A part is considered active if it is the currently active part in its grid.
 * Additionally, if the part is associated with an activity, the activity must also be active.
 */
function isActive(partId: PartId, layout: ɵWorkbenchLayout): boolean {
  const {grid} = layout.grid({partId: partId});
  if (grid.activePartId !== partId) {
    return false;
  }

  const activity = layout.activity({partId: partId}, {orElse: null});
  if (activity && layout.activityStack({activityId: activity.id}).activeActivityId !== activity.id) {
    return false;
  }
  return true;
}

/**
 * Computes actions matching this part.
 */
function computePartActions(part: ɵWorkbenchPart): Signal<WorkbenchPartAction[]> {
  const injector = Injector.create({
    parent: inject(Injector),
    providers: [
      {provide: ɵWorkbenchPart, useValue: part},
      {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
    ],
  });

  // Use a differ to avoid re-creating every action on registration or change.
  const differ = inject(IterableDiffers).find([]).create<WorkbenchPartActionFn>();
  const partActionRegistry = inject(WORKBENCH_PART_ACTION_REGISTRY);
  const partActions = new Map<WorkbenchPartActionFn, Signal<WorkbenchPartAction | null>>();

  return computed(() => {
    const changes = differ.diff(partActionRegistry.objects());
    changes?.forEachAddedItem(({item: fn}) => partActions.set(fn, computed(() => constructPartAction(fn, injector))));
    changes?.forEachRemovedItem(({item: fn}) => partActions.delete(fn));
    return Array.from(partActions.values()).map(partAction => partAction()).filter(partAction => !!partAction);
  }, {equal: (a, b) => Arrays.isEqual(a, b)});

  function constructPartAction(factoryFn: WorkbenchPartActionFn, injector: Injector): WorkbenchPartAction | null {
    const action: WorkbenchPartAction | ComponentType<unknown> | TemplateRef<unknown> | null = runInInjectionContext(injector, () => factoryFn(inject(ɵWorkbenchPart)));
    if (action instanceof TemplateRef || typeof action === 'function') {
      return {content: action};
    }
    return action;
  }
}

/**
 * Computes the active view of given part, or `null` if none.
 */
function computeActiveView(mPart: Signal<MPart>): Signal<ɵWorkbenchView | null> {
  const viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  return computed(() => mPart().activeViewId ? viewRegistry.get(mPart().activeViewId!) : null);
}

/**
 * Computes the views opened in given part.
 */
function computeViews(mPart: Signal<MPart>): Signal<ɵWorkbenchView[]> {
  const viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  return computed(() => mPart().views.map(mView => viewRegistry.get(mView.id)), {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: true})});
}
