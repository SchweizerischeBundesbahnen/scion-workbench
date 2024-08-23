/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {computed, effect, EnvironmentInjector, inject, Injector, runInInjectionContext, Signal, signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPartAction} from '../workbench.model';
import {WorkbenchPart} from './workbench-part.model';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {WorkbenchPartActionRegistry} from './workbench-part-action.registry';
import {filter} from 'rxjs/operators';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ViewId} from '../view/workbench-view.model';
import {Event, NavigationStart, Router, RouterEvent} from '@angular/router';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

export class ɵWorkbenchPart implements WorkbenchPart {

  private _activationInstant: number | undefined;

  private readonly _partEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _partActionRegistry = inject(WorkbenchPartActionRegistry);
  private readonly _partComponent: ComponentType<PartComponent | MainAreaLayoutComponent>;

  public readonly active = signal(false);
  public readonly viewIds = signal<ViewId[]>([], {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: true})});
  public readonly activeViewId = signal<ViewId | null>(null);
  public readonly actions: Signal<WorkbenchPartAction[]>;

  private _isInMainArea: boolean | undefined;

  constructor(public readonly id: string, options: {component: ComponentType<PartComponent | MainAreaLayoutComponent>}) {
    this._partComponent = options.component;
    this.actions = this.selectPartActions();
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
    this.active.set(active);
    this.viewIds.set(mPart.views.map(view => view.id));
    this.activeViewId.set(mPart.activeViewId ?? null);
  }

  /**
   * Activates this part.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activate(): Promise<boolean> {
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

  /**
   * Selects actions matching this part and the currently active view.
   */
  private selectPartActions(): Signal<WorkbenchPartAction[]> {
    const injector = inject(Injector);

    const actions = toSignal(this._partActionRegistry.actions$, {requireSync: true});

    return computed(() => {
      // Filter actions by calling `canMatch`, if any.
      return actions().filter(action => {
        // - Run function in injection context for `canMatch` function to inject dependencies.
        // - Run function in a reactive context to track signals. (e.g., view's active state).
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
 * Represents a pseudo-type for the actual {@link MainAreaLayoutComponent} which must not be referenced in order to avoid import cycles.
 */
type MainAreaLayoutComponent = any;
