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
import {MPart, MTreeNode, WorkbenchGrids} from '../layout/workbench-grid.model';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';
import {MActivity} from '../activity/workbench-activity.model';

export class ɵWorkbenchPart implements WorkbenchPart {

  private readonly _partEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _rootOutletContexts = inject(ChildrenOutletContexts);
  private readonly _layout = inject(WorkbenchLayoutService).layout;
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _partComponent: ComponentType<PartComponent | MainAreaPartComponent>; // eslint-disable-line @typescript-eslint/no-duplicate-type-constituents
  private readonly _title = signal<string | undefined>(undefined);
  private readonly _titleComputed = this.computeTitle();

  public readonly alternativeId: string | undefined;
  public readonly navigation = signal<WorkbenchPartNavigation | undefined>(undefined);
  public readonly active = signal(false);
  public readonly viewIds = signal<ViewId[]>([], {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: true})});
  public readonly activeViewId = signal<ViewId | null>(null);
  public readonly gridName: WritableSignal<keyof WorkbenchGrids>;
  public readonly peripheral = signal(false);
  public readonly topLeft = signal(false);
  public readonly topRight = signal(false);
  public readonly activity = signal<MActivity | null>(null);
  public readonly canMinimize = computed(() => this.activity() !== null && this.topRight());
  public readonly actions: Signal<WorkbenchPartAction[]>;
  public readonly classList = new ClassList();

  private _isInMainArea: boolean | undefined;
  private _activationInstant: number | undefined;

  /**
   * Reference to the HTML element of {@link PartComponent} or {@link MainAreaPartComponent}.
   */
  public partComponent: HTMLElement | undefined;

  constructor(public readonly id: PartId, layout: ɵWorkbenchLayout, options: {component: ComponentType<PartComponent | MainAreaPartComponent>}) { // eslint-disable-line @typescript-eslint/no-duplicate-type-constituents
    this.alternativeId = layout.part({partId: this.id}).alternativeId;
    this._partComponent = options.component;
    this.gridName = signal(layout.grid({partId: id}).gridName);
    this.actions = this.computePartActions();
    this.touchOnActivate();
    this.installModelUpdater();
    this.onLayoutChange({layout});
  }

  /**
   * Constructs the portal using the given injection context.
   */
  public createPortalFromInjectionContext(injectionContext: Injector): ComponentPortal<PartComponent | MainAreaPartComponent> { // eslint-disable-line @typescript-eslint/no-duplicate-type-constituents
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
    const {gridName, grid} = layout.grid({partId: this.id});
    this.gridName.set(gridName);
    this.peripheral.set(layout.isPeripheralPart(this.id));
    this.active.set(grid.activePartId === this.id);
    this.viewIds.set(mPart.views.map(view => view.id));
    this.activeViewId.set(mPart.activeViewId ?? null);
    this.activity.set(layout.activity({partId: this.id}, {orElse: null}));
    this.topLeft.set(isTopLeft(grid.root, layout.part({partId: this.id})));
    this.topRight.set(isTopRight(grid.root, layout.part({partId: this.id})));

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

      // If this part is the top-leftmost part, return the activity title set on the layout.
      if (this.topLeft()) {
        return this._layout().part({partId: activity.referencePartId}).title;
      }

      // If this part is the reference part but not positioned top-leftmost, only return the handle's title, not the activity title set on the layout.
      if (this.id === activity.referencePartId) {
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
      {skipLocationChange: true}, // do not add part activation into browser history stack
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
   * Computes actions matching this part.
   */
  private computePartActions(): Signal<WorkbenchPartAction[]> {
    const injector = Injector.create({
      parent: inject(Injector),
      providers: [
        {provide: ɵWorkbenchPart, useValue: this},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
      ],
    });

    // Use a differ to avoid re-creating every action on registration or change.
    const differ = inject(IterableDiffers).find([]).create<WorkbenchPartActionFn>();
    const partActionRegistry = inject(WORKBENCH_PART_ACTION_REGISTRY);
    const partActions = new Map<WorkbenchPartActionFn, Signal<WorkbenchPartAction | null>>();

    return computed(() => {
      const changes = differ.diff(partActionRegistry.objects());
      changes?.forEachAddedItem(({item: fn}) => partActions.set(fn, computed(() => runInInjectionContext(injector, () => constructAction(this, fn)))));
      changes?.forEachRemovedItem(({item: fn}) => partActions.delete(fn));
      return Array.from(partActions.values()).map(partAction => partAction()).filter(partAction => !!partAction);
    }, {equal: (a, b) => Arrays.isEqual(a, b)});

    function constructAction(part: WorkbenchPart, factoryFn: WorkbenchPartActionFn): WorkbenchPartAction | null {
      const action: WorkbenchPartAction | ComponentType<unknown> | TemplateRef<unknown> | null = factoryFn(part);
      if (action instanceof TemplateRef || typeof action === 'function') {
        return {content: action};
      }
      return action;
    }
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
 * Tests if this part is the top-leftmost part.
 */
function isTopLeft(element: MTreeNode | MPart, testee: MPart): boolean {
  if (element instanceof MPart) {
    return element.id === testee.id;
  }

  const child1Visible = WorkbenchLayouts.isGridElementVisible(element.child1);
  return isTopLeft(child1Visible ? element.child1 : element.child2, testee);
}

/**
 * Tests if this part is the top-rightmost part.
 */
function isTopRight(element: MTreeNode | MPart, testee: MPart): boolean {
  if (element instanceof MPart) {
    return element.id === testee.id;
  }

  const child1Visible = WorkbenchLayouts.isGridElementVisible(element.child1);
  const child2Visible = WorkbenchLayouts.isGridElementVisible(element.child2);

  if (child1Visible && child2Visible) {
    return element.direction === 'column' ? isTopRight(element.child1, testee) : isTopRight(element.child2, testee);
  }
  return isTopRight(child1Visible ? element.child1 : element.child2, testee);
}

/**
 * Represents a pseudo-type for the actual {@link PartComponent} which must not be referenced in order to avoid import cycles.
 */
type PartComponent = unknown;

/**
 * Represents a pseudo-type for the actual {@link MainAreaPartComponent} which must not be referenced in order to avoid import cycles.
 */
type MainAreaPartComponent = unknown;
