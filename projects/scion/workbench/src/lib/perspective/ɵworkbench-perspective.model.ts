/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {MPartGrid} from '../layout/workbench-layout.model';
import {EnvironmentInjector, inject, InjectionToken, runInInjectionContext} from '@angular/core';
import {WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Commands, WorkbenchNavigation, WorkbenchRouter} from '../routing/workbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {filter, map, takeUntil} from 'rxjs/operators';
import {WorkbenchLayoutSerializer} from '../layout/workench-layout-serializer.service';
import {RouterUtils} from '../routing/router.util';
import {Router} from '@angular/router';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {serializeExecution} from '../common/operators';

/**
 * DI token that holds the identity of the active perspective.
 */
const ACTIVE_PERSPECTIVE_ID$ = new InjectionToken<BehaviorSubject<string | undefined>>('ACTIVE_PERSPECTIVE_ID$', {
  providedIn: 'root',
  factory: () => new BehaviorSubject<string | undefined>(undefined),
});

/**
 * @inheritDoc
 */
export class ɵWorkbenchPerspective implements WorkbenchPerspective {

  private _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private _workbenchGridMerger = inject(WorkbenchGridMerger);
  private _workbenchPerspectiveStorageService = inject(WorkbenchPerspectiveStorageService);
  private _workbenchLayoutService = inject(WorkbenchLayoutService);
  private _workbenchLayoutSerializer = inject(WorkbenchLayoutSerializer);
  private _workbenchRouter = inject(WorkbenchRouter);
  private _router = inject(Router);
  private _environmentInjector = inject(EnvironmentInjector);
  private _initialLayoutFn: WorkbenchLayoutFn;
  private _activePerspectiveId$ = inject(ACTIVE_PERSPECTIVE_ID$);
  private _perspectiveViewConflictResolver = inject(WorkbenchPerspectiveViewConflictResolver);
  private _destroy$ = new Subject<void>();

  private _initialWorkbenchGrid: MPartGrid | undefined;
  private _workbenchGrid: MPartGrid | undefined;
  private _viewOutlets: {[viewId: string]: Commands} = {};

  public id: string;
  public transient: boolean;
  public data: {[key: string]: any};
  public active$: Observable<boolean>;

  constructor(definition: WorkbenchPerspectiveDefinition) {
    this.id = definition.id;
    this.transient = definition.transient ?? false;
    this.data = definition.data ?? {};
    this.active$ = this._activePerspectiveId$.pipe(map(activePerspectiveId => activePerspectiveId === this.id));
    this._initialLayoutFn = definition.layout;
    this.onLayoutChange(layout => this.storePerspectiveLayout(layout));
  }

  /**
   * Activates this perspective.
   */
  public async activate(): Promise<boolean> {
    // Create the initial workbench grid when constructed for the first time.
    this._initialWorkbenchGrid ??= await this.createInitialWorkbenchGrid();

    // Load perspective data from storage.
    const perspectiveData = !this.transient ? await this._workbenchPerspectiveStorageService.loadPerspectiveData(this.id) : null;
    if (perspectiveData) {
      this._workbenchGrid = this._workbenchGridMerger.merge({
        local: this._workbenchLayoutFactory.create({workbenchGrid: perspectiveData.workbenchGrid}).workbenchGrid,
        base: this._workbenchLayoutFactory.create({workbenchGrid: perspectiveData.initialWorkbenchGrid}).workbenchGrid,
        remote: this._initialWorkbenchGrid,
      });
      this._viewOutlets = perspectiveData.viewOutlets;
    }
    else {
      this._workbenchGrid ??= this._initialWorkbenchGrid;
      this._viewOutlets ??= {};
    }

    // Memoize currently active perspective for a potential rollback in case the activation fails.
    const currentActivePerspectiveId = this._activePerspectiveId$.value;

    // Perform navigation to activate the layout of this perspective.
    const navigated = await this._workbenchRouter.ɵnavigate(currentLayout => {
      // Mark this perspective as active after the initial navigation (1) but before the actual Angular routing (2).
      //
      // (1) Otherwise, if the initial navigation is asynchronous, such as when lazy loading components or using asynchronous guards,
      //     the activation of the initial perspective would apply the "default" grid with only the main area.
      // (2) Enables routes to evaluate the active perspective in a `canMatch` guard, e.g., to display a perspective-specific start page.
      this._activePerspectiveId$.next(this.id);

      // Apply the layout of this perspective.
      return this.createActivationNavigation(currentLayout);
    });
    if (!navigated) {
      this._activePerspectiveId$.next(currentActivePerspectiveId);
    }
    return navigated;
  }

  /**
   * Resets this perspective to its initial layout.
   */
  public async reset(): Promise<void> {
    this._workbenchGrid = this._initialWorkbenchGrid;
    this._viewOutlets = {};

    // Apply the initial perspective layout.
    await this._workbenchRouter.ɵnavigate(currentLayout => this.createActivationNavigation(currentLayout));
  }

  /**
   * Creates the {@link WorkbenchNavigation} object to activate this perspective.
   *
   * When switching perspective, name clashes between the views contained in the perspective
   * and the views contained in the main area are possible. The navigation detects and resolves name conflicts,
   * changing the layout of this perspective if necessary.
   */
  private createActivationNavigation(currentLayout: ɵWorkbenchLayout): WorkbenchNavigation {
    if (!this._workbenchGrid) {
      throw Error('[WorkbenchPerspectiveError] Perspective not yet constructed.');
    }

    // If the current layout has a main area, resolve name clashes between views of this perspective and views contained in the main area.
    if (currentLayout.mainAreaGrid) {
      const resolved = this._perspectiveViewConflictResolver.resolve(currentLayout.mainAreaGrid, {workbenchGrid: this._workbenchGrid, viewOutlets: this._viewOutlets});
      this._workbenchGrid = resolved.workbenchGrid;
      this._viewOutlets = resolved.viewOutlets;
    }

    const newLayout = this._workbenchLayoutFactory.create({
      workbenchGrid: this._workbenchGrid,
      mainAreaGrid: currentLayout.mainAreaGrid,
      // Do not preserve maximized state when switching between perspectives.
    });

    // Preserve view outlets defined in current layout's main area only if new layout contains a main area.
    const outletsToRemove = newLayout.mainAreaGrid ? currentLayout.views({grid: 'workbench'}) : currentLayout.views();

    return {
      layout: newLayout,
      viewOutlets: {
        // Remove outlets of current perspective from the URL.
        ...RouterUtils.outletsFromCurrentUrl(this._router, outletsToRemove.map(view => view.id), () => null),
        // Add outlets of the perspective to activate to the URL.
        ...this._viewOutlets,
      },
    };
  }

  public get active(): boolean {
    return this._activePerspectiveId$.value === this.id;
  }

  /**
   * Creates the initial workbench grid of this perspective as defined in the perspective definition.
   */
  private async createInitialWorkbenchGrid(): Promise<MPartGrid> {
    const layout = await runInInjectionContext(this._environmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory));
    return (layout as ɵWorkbenchLayout).workbenchGrid;
  }

  /**
   * Invokes the callback when the layout of this perspective changes.
   */
  private onLayoutChange(callback: (layout: ɵWorkbenchLayout) => Promise<void>): void {
    this._workbenchLayoutService.layout$
      .pipe(
        filter(() => this.active),
        serializeExecution(callback),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  /**
   * Stores the layout of this perspective.
   *
   * If an anonymous perspective, only memoizes the layout, but does not write it to storage.
   */
  private async storePerspectiveLayout(layout: ɵWorkbenchLayout): Promise<void> {
    // Memoize layout and outlets.
    this._workbenchGrid = layout.workbenchGrid;
    this._viewOutlets = RouterUtils.outletsFromCurrentUrl(this._router, layout.views({grid: 'workbench'}).map(view => view.id));

    // Store the layout if not a transient perspective.
    if (!this.transient) {
      await this._workbenchPerspectiveStorageService.storePerspectiveData(this.id, {
        initialWorkbenchGrid: this._workbenchLayoutSerializer.serialize(this._initialWorkbenchGrid),
        workbenchGrid: this._workbenchLayoutSerializer.serialize(this._workbenchGrid),
        viewOutlets: this._viewOutlets,
      });
    }
  }

  public destroy(): void {
    this._destroy$.next();
  }
}
