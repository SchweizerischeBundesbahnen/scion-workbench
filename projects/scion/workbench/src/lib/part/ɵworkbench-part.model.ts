/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {BehaviorSubject, Observable, switchMap} from 'rxjs';
import {EnvironmentInjector, inject, Injector, runInInjectionContext} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPartAction} from '../workbench.model';
import {WorkbenchPart} from './workbench-part.model';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {WorkbenchPartActionRegistry} from './workbench-part-action.registry';
import {filterArray} from '@scion/toolkit/operators';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ViewId} from '../view/workbench-view.model';
import {Event, NavigationStart, Router, RouterEvent} from '@angular/router';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export class ɵWorkbenchPart implements WorkbenchPart {

  private _activationInstant: number | undefined;

  private readonly _partEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _partActionRegistry = inject(WorkbenchPartActionRegistry);
  private readonly _partComponent: ComponentType<PartComponent | MainAreaLayoutComponent>;

  public readonly active$ = new BehaviorSubject<boolean>(false);
  public readonly viewIds$ = new BehaviorSubject<ViewId[]>([]);
  public readonly activeViewId$ = new BehaviorSubject<ViewId | null>(null);
  public readonly actions$: Observable<readonly WorkbenchPartAction[]>;

  private _isInMainArea: boolean | undefined;

  constructor(public readonly id: string, options: {component: ComponentType<PartComponent | MainAreaLayoutComponent>}) {
    this._partComponent = options.component;
    this.actions$ = this.observePartActions$();
    this.touchOnActivate();
    this.installModelUpdater();
    this.onLayoutChange(this._workbenchRouter.getCurrentNavigationContext().layout);
  }

  /**
   * Constructs the portal using the given injection context.
   */
  public createPortalFromInjectionContext(injectionContext: Injector): ComponentPortal<PartComponent | MainAreaLayoutComponent> {
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
   * - is called on every layout change, including changes not relevant for this part.
   */
  private onLayoutChange(layout: ɵWorkbenchLayout): void {
    this._isInMainArea ??= layout.hasPart(this.id, {grid: 'mainArea'});
    const mPart = layout.part({partId: this.id});
    const active = layout.activePart({grid: this._isInMainArea ? 'mainArea' : 'workbench'})?.id === this.id;
    const prevViewIds = this.viewIds$.value;
    const currViewIds = mPart.views.map(view => view.id);

    // Update active part if changed
    if (this.active !== active) {
      this.active$.next(active);
    }

    // Update views if changed
    if (!Arrays.isEqual(prevViewIds, currViewIds, {exactOrder: true})) {
      this.viewIds$.next(currViewIds);
    }

    // Update active view if changed
    if (this.activeViewId !== mPart.activeViewId) {
      this.activeViewId$.next(mPart.activeViewId ?? null);
    }
  }

  public get viewIds(): ViewId[] {
    return this.viewIds$.value;
  }

  public get activeViewId(): ViewId | null {
    return this.activeViewId$.value;
  }

  /**
   * Activates this part.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activate(): Promise<boolean> {
    if (this.active) {
      return true;
    }

    const currentLayout = this._workbenchLayoutService.layout;
    return this._workbenchRouter.navigate(
      layout => currentLayout === layout ? layout.activatePart(this.id) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: true}, // do not add part activation into browser history stack
    );
  }

  public get active(): boolean {
    return this.active$.value;
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

  /**
   * Emits actions that have contributed to this part and the currently active view.
   */
  private observePartActions$(): Observable<WorkbenchPartAction[]> {
    const injector = inject(Injector);
    return this._partActionRegistry.actions$
      .pipe(
        switchMap(actions => this.activeViewId$.pipe(map(() => actions))),
        // Run in injection context for `canMatch` function to inject dependencies.
        filterArray((action: WorkbenchPartAction): boolean => runInInjectionContext(injector, () => action.canMatch?.(this) ?? true)),
        distinctUntilChanged(),
      );
  }

  /**
   * Updates the activation instant when this part is activated.
   */
  private touchOnActivate(): void {
    this.active$
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._activationInstant = this._activationInstantProvider.now();
      });
  }

  /**
   * Sets up automatic synchronization of {@link WorkbenchPart} on every layout change.
   *
   * If the operation is cancelled (e.g., due to a navigation failure), it reverts the changes.
   */
  private installModelUpdater(): void {
    inject(Router).events
      .pipe(
        filter((event: Event | RouterEvent): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const navigationContext = this._workbenchRouter.getCurrentNavigationContext();
        const {layout, previousLayout, layoutDiff} = navigationContext;

        if (layoutDiff.removedParts.includes(this.id)) {
          return;
        }

        this.onLayoutChange(layout);

        // Revert change in case the navigation fails.
        if (previousLayout?.hasPart(this.id)) {
          navigationContext.registerUndoAction(() => this.onLayoutChange(previousLayout));
        }
      });
  }

  public destroy(): void {
    this._partEnvironmentInjector.destroy();
    // IMPORTANT: Only detach the active view, not destroy it, because views are explicitly destroyed when view handles are removed.
    // Otherwise, moving the last view to another part would fail because the view would already be destroyed.
    if (this.activeViewId) {
      this._viewRegistry.get(this.activeViewId, {orElse: null})?.portal.detach();
    }
  }
}

/**
 * Represents a pseudo-type for the actual {@link PartComponent} which must not be referenced in order to avoid import cycles.
 */
type PartComponent = any;

/**
 * Represents a pseudo-type for the actual {@link MainAreaLayoutComponent} which must not be referenced in order to avoid import cycles.
 */
type MainAreaLayoutComponent = any;
