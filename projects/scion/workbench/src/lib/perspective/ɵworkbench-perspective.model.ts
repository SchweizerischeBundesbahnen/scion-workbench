/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {MPartGrid} from '../layout/workbench-layout.model';
import {EnvironmentInjector, inject, InjectionToken, runInInjectionContext} from '@angular/core';
import {WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Commands, WorkbenchNavigation, WorkbenchRouter} from '../routing/workbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchPeripheralGridMerger} from './workbench-peripheral-grid-merger.service';
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

  private _workbenchLayoutFactory = inject(WorkbenchLayoutFactory);
  private _workbenchPeripheralGridMerger = inject(WorkbenchPeripheralGridMerger);
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

  private _initialGrid: MPartGrid | undefined;
  private _grid: MPartGrid | undefined;
  private _viewOutlets: {[viewId: string]: Commands} = {};

  public id: string;
  public data: {[key: string]: any};
  public active$: Observable<boolean>;

  constructor(definition: WorkbenchPerspectiveDefinition) {
    this.id = definition.id;
    this.data = definition.data ?? {};
    this.active$ = this._activePerspectiveId$.pipe(map(activePerspectiveId => activePerspectiveId === this.id));
    this._initialLayoutFn = definition.layout;

    // Store perspective layout on layout change.
    this._workbenchLayoutService.layout$
      .pipe(
        filter(() => this.active),
        serializeExecution(layout => this.onPerspectiveLayoutChange(layout)),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  /**
   * Activates this perspective.
   */
  public async activate(): Promise<boolean> {
    // Create the initial grid when constructed for the first time.
    this._initialGrid ??= await this.createInitialGrid();

    // Load perspective data from storage.
    const perspectiveData = await this._workbenchPerspectiveStorageService.loadPerspectiveData(this.id);
    if (perspectiveData) {
      this._grid = this._workbenchPeripheralGridMerger.merge({
        local: this._workbenchLayoutFactory.create({peripheralGrid: perspectiveData.grid}).peripheralGrid,
        base: this._workbenchLayoutFactory.create({peripheralGrid: perspectiveData.initialGrid}).peripheralGrid,
        remote: this._initialGrid,
      });
      this._viewOutlets = perspectiveData.viewOutlets;
    }
    else {
      this._grid = this._initialGrid;
      this._viewOutlets = {};
    }

    // Memoize currently active perspective for a potential rollback in case the activation fails.
    const currentActivePerspectiveId = this._activePerspectiveId$.value;

    // Mark this perspective as active; must be set before routing for routes to evaluate the current perspective in a `canMatch` guard,
    // e.g., to display a perspective-specific start page.
    this._activePerspectiveId$.next(this.id);

    // Apply the perspective layout.
    const navigated = await this._workbenchRouter.ɵnavigate(currentLayout => this.createActivationNavigation(currentLayout));
    if (!navigated) {
      this._activePerspectiveId$.next(currentActivePerspectiveId);
    }
    return navigated;
  }

  /**
   * Resets this perspective to its initial layout.
   */
  public async reset(): Promise<void> {
    this._grid = this._initialGrid;
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
    if (!this._grid) {
      throw Error('[WorkbenchPerspectiveError] Perspective not yet constructed.');
    }

    // Resolve name clashes between views defined by this perspective and views contained in the main area.
    const resolved = this._perspectiveViewConflictResolver.resolve(currentLayout.mainGrid, {grid: this._grid, viewOutlets: this._viewOutlets});
    if (resolved) {
      this._grid = resolved.grid;
      this._viewOutlets = resolved.viewOutlets;
    }

    return {
      layout: this._workbenchLayoutFactory.create({
        peripheralGrid: this._grid,
        mainGrid: currentLayout.mainGrid,
      }),
      viewOutlets: {
        // Remove outlets of current perspective from the URL.
        ...RouterUtils.outletsFromCurrentUrl(this._router, currentLayout.views({scope: 'peripheral'}).map(view => view.id), () => null),
        // Add outlets of the perspective to activate to the URL.
        ...this._viewOutlets,
      },
    };
  }

  public get active(): boolean {
    return this._activePerspectiveId$.value === this.id;
  }

  /**
   * Creates the initial grid of this perspective as defined in the perspective definition.
   */
  private async createInitialGrid(): Promise<MPartGrid> {
    const layout = await runInInjectionContext(this._environmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory.create()));
    return (layout as ɵWorkbenchLayout).peripheralGrid;
  }

  /**
   * Method invoked each time the layout of this perspective changes.
   */
  private async onPerspectiveLayoutChange(layout: ɵWorkbenchLayout): Promise<void> {
    // Memoize layout and outlets.
    this._grid = layout.peripheralGrid;
    this._viewOutlets = RouterUtils.outletsFromCurrentUrl(this._router, layout.views({scope: 'peripheral'}).map(view => view.id));

    // Store the perspective layout.
    await this._workbenchPerspectiveStorageService.storePerspectiveData(this.id, {
      initialGrid: this._workbenchLayoutSerializer.serialize(this._initialGrid!, {nullIfEmpty: true}),
      grid: this._workbenchLayoutSerializer.serialize(this._grid!, {nullIfEmpty: true}),
      viewOutlets: this._viewOutlets,
    });
  }

  public destroy(): void {
    this._destroy$.next();
  }
}
