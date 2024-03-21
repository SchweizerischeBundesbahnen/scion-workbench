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
import {EnvironmentInjector, inject, InjectionToken, runInInjectionContext} from '@angular/core';
import {MPerspectiveLayout, WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';
import {filter, map, takeUntil} from 'rxjs/operators';
import {WorkbenchLayoutSerializer} from '../layout/workench-layout-serializer.service';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {serializeExecution} from '../common/operators';
import {UrlSegment} from '@angular/router';

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
  private _environmentInjector = inject(EnvironmentInjector);
  private _initialLayoutFn: WorkbenchLayoutFn;
  private _activePerspectiveId$ = inject(ACTIVE_PERSPECTIVE_ID$);
  private _perspectiveViewConflictResolver = inject(WorkbenchPerspectiveViewConflictResolver);
  private _destroy$ = new Subject<void>();

  private _initialPerspectiveLayout: MPerspectiveLayout | undefined;
  private _perspectiveLayout: MPerspectiveLayout | undefined;

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
    this._initialPerspectiveLayout ??= await this.createInitialPerspectiveLayout();

    // Load the layout from the storage, if present, or use the initial layout otherwise.
    this._perspectiveLayout = (await this.loadPerspectiveLayout()) ?? this._initialPerspectiveLayout;

    // Memoize currently active perspective for a potential rollback in case the activation fails.
    const currentActivePerspectiveId = this._activePerspectiveId$.value;

    // Perform navigation to activate the layout of this perspective.
    const navigated = await this.navigatePerspective(() => {
      // Mark this perspective as active after the initial navigation (1) but before the actual Angular routing (2).
      //
      // (1) Otherwise, if the initial navigation is asynchronous, such as when lazy loading components or using asynchronous guards,
      //     the activation of the initial perspective would apply the "default" grid with only the main area.
      // (2) Enables routes to evaluate the active perspective in a `canMatch` guard, e.g., to display a perspective-specific start page.
      this._activePerspectiveId$.next(this.id);
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
    this._perspectiveLayout = this._initialPerspectiveLayout;

    // Apply the initial perspective layout.
    await this.navigatePerspective();
  }

  /**
   * Performs a navigation to activate the layout of this perspective.
   */
  private navigatePerspective(onNavigate?: (layout: ɵWorkbenchLayout) => void): Promise<boolean> {
    return this._workbenchRouter.ɵnavigate(currentLayout => {
      if (!this._perspectiveLayout) {
        throw Error('[WorkbenchPerspectiveError] Perspective not yet constructed.');
      }

      // View outlets of the new layout.
      const viewOutlets = new Map<string, UrlSegment[]>();

      // When switching perspective, name clashes between the views contained in the perspective and the views contained in the main
      // area are possible. In the following, if the layout has a main area, we detect and resolve name conflicts, changing the layout
      // of this perspective if necessary.
      if (currentLayout.mainAreaGrid && WorkbenchLayouts.hasMainArea(this._perspectiveLayout.workbenchGrid)) {
        this._perspectiveLayout = this._perspectiveViewConflictResolver.resolve(currentLayout.mainAreaGrid, this._perspectiveLayout);
      }

      // Preserve view outlets defined in current layout's main area, if any.
      if (currentLayout.mainAreaGrid && WorkbenchLayouts.hasMainArea(this._perspectiveLayout.workbenchGrid)) {
        Object.entries(currentLayout.viewOutlets({grid: 'mainArea'})).forEach(([viewId, segments]) => {
          viewOutlets.set(viewId, segments);
        });
      }

      // Add view outlets for non-static views referenced in the perspective.
      Object.entries(this._perspectiveLayout.viewOutlets).forEach(([viewId, segments]) => {
        viewOutlets.set(viewId, segments);
      });

      // Create the layout to activate this perspective.
      const newLayout = this._workbenchLayoutFactory.create({
        workbenchGrid: this._perspectiveLayout.workbenchGrid,
        mainAreaGrid: currentLayout.mainAreaGrid,
        viewOutlets: Object.fromEntries(viewOutlets),
        viewStates: currentLayout.viewStates({grid: 'mainArea'}), // preserve view state of views in main area; view state of perspective cannot be restored since not persisted
        // Do not preserve maximized state when switching between perspectives.
      });

      // Pass control to the navigator.
      onNavigate?.(newLayout);

      return newLayout;
    });
  }

  public get active(): boolean {
    return this._activePerspectiveId$.value === this.id;
  }

  /**
   * Creates the initial workbench grid of this perspective as defined in the perspective definition.
   */
  private async createInitialPerspectiveLayout(): Promise<MPerspectiveLayout> {
    const layout = (await runInInjectionContext(this._environmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory))) as ɵWorkbenchLayout;
    return {
      workbenchGrid: layout.workbenchGrid,
      viewOutlets: layout.viewOutlets(),
    };
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
   * Loads the layout of this perspective from storage, or returns `null` if not present.
   */
  private async loadPerspectiveLayout(): Promise<MPerspectiveLayout | null> {
    if (this.transient) {
      return this._perspectiveLayout ?? null;
    }

    const perspectiveLayouts = await this._workbenchPerspectiveStorageService.loadPerspectiveLayouts(this.id);
    if (!perspectiveLayouts) {
      return null;
    }

    return this._workbenchGridMerger.merge({
      local: {
        workbenchGrid: this._workbenchLayoutSerializer.deserialize(perspectiveLayouts.userLayout.workbenchGrid),
        viewOutlets: this._workbenchLayoutSerializer.deserializeViewOutlets(perspectiveLayouts.userLayout.viewOutlets),
      },
      base: {
        workbenchGrid: this._workbenchLayoutSerializer.deserialize(perspectiveLayouts.referenceLayout.workbenchGrid),
        viewOutlets: this._workbenchLayoutSerializer.deserializeViewOutlets(perspectiveLayouts.referenceLayout.viewOutlets),
      },
      remote: {
        workbenchGrid: this._initialPerspectiveLayout!.workbenchGrid,
        viewOutlets: this._initialPerspectiveLayout!.viewOutlets,
      },
    });
  }

  /**
   * Stores the layout of this perspective.
   *
   * If an anonymous perspective, only memoizes the layout, but does not write it to storage.
   */
  private async storePerspectiveLayout(layout: ɵWorkbenchLayout): Promise<void> {
    // Memoize layout and outlets.
    this._perspectiveLayout = {
      workbenchGrid: layout.workbenchGrid,
      viewOutlets: layout.viewOutlets({grid: 'workbench'}),
    };

    // Store the layout if not a transient perspective.
    if (!this.transient) {
      await this._workbenchPerspectiveStorageService.storePerspectiveLayouts(this.id, {
        referenceLayout: {
          workbenchGrid: this._workbenchLayoutSerializer.serialize(this._initialPerspectiveLayout!.workbenchGrid),
          viewOutlets: this._workbenchLayoutSerializer.serializeViewOutlets(this._initialPerspectiveLayout!.viewOutlets),
        },
        userLayout: {
          workbenchGrid: this._workbenchLayoutSerializer.serialize(this._perspectiveLayout.workbenchGrid),
          viewOutlets: this._workbenchLayoutSerializer.serializeViewOutlets(this._perspectiveLayout.viewOutlets),
        },
      });
    }
  }

  public destroy(): void {
    this._destroy$.next();
  }
}
