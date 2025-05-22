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
import {computed, EnvironmentInjector, inject, InjectionToken, Injector, runInInjectionContext, Signal} from '@angular/core';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutMerger} from '../layout/workbench-layout-merger.service';
import {WorkbenchLayoutStorageService} from '../layout/workbench-layout-storage.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {LatestTaskExecutor} from '../executor/latest-task-executor';
import {UrlSegment} from '@angular/router';
import {WorkbenchLayoutFn} from '../layout/workbench-layout';
import {WORKBENCH_PERSPECTIVE_REGISTRY} from './workbench-perspective.registry';
import {WorkbenchStartup} from '../startup/workbench-startup.service';
import {Objects} from '../common/objects.util';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {filter, skip, switchMap} from 'rxjs/operators';
import {from} from 'rxjs';

/**
 * @inheritDoc
 */
export class ɵWorkbenchPerspective implements WorkbenchPerspective {

  private readonly _perspectiveEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchLayoutMerger = inject(WorkbenchLayoutMerger);
  private readonly _workbenchlayoutStorageService = inject(WorkbenchLayoutStorageService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _initialLayoutFn: WorkbenchLayoutFn;
  private readonly _perspectiveViewConflictResolver = inject(WorkbenchPerspectiveViewConflictResolver);

  public readonly id: string;
  public readonly transient: boolean;
  public readonly data: {[key: string]: any};
  public readonly active: Signal<boolean>;

  private _initialLayout: ɵWorkbenchLayout | undefined;
  private _layout: ɵWorkbenchLayout | undefined;

  constructor(definition: WorkbenchPerspectiveDefinition) {
    this.id = definition.id;
    this.transient = definition.transient ?? false;
    this.data = definition.data ?? {};

    const activePerspective = inject(ACTIVE_PERSPECTIVE);
    this.active = computed(() => activePerspective()?.id === this.id);

    this._initialLayoutFn = definition.layout;
    this.installLayoutPersister();
  }

  /**
   * Activates this perspective.
   */
  public async activate(): Promise<boolean> {
    // Create the initial layout when constructed for the first time.
    this._initialLayout ??= await this.createInitialLayout();

    // Load the layout from the storage, if present, or use the initial layout otherwise.
    this._layout = (await this.loadLayout()) ?? this._initialLayout;

    // Perform navigation to activate the layout of this perspective.
    return this._workbenchRouter.navigate(currentLayout => this.createLayoutForActivation(currentLayout));
  }

  /**
   * Resets this perspective to its initial layout.
   */
  public async reset(): Promise<void> {
    this._layout = this._initialLayout;

    // Reset to the initial layout.
    await this._workbenchRouter.navigate(currentLayout => this.createLayoutForActivation(currentLayout));
  }

  /**
   * Reference to the handle's injector. The injector will be destroyed when unregistering the perspective.
   */
  public get injector(): Injector {
    return this._perspectiveEnvironmentInjector;
  }

  /**
   * Creates the perspective layout using the main area of the current layout.
   *
   * When switching perspective, id clashes between views contained in the perspective and the main area are possible.
   * The activation detects and resolves conflicts, changing the layout of this perspective if necessary.
   */
  private createLayoutForActivation(currentLayout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    if (!this._layout) {
      throw Error(`[PerspectiveActivateError] Perspective '${this.id}' not constructed.`);
    }

    // Outlets of the new layout.
    const outlets = new Map<string, UrlSegment[]>();

    // Add outlets of the main area and resolve conflicts if any.
    if (currentLayout.grids.mainArea && this._layout.grids.mainArea) {
      // Detect and resolve id clashes between views defined by this perspective and views contained in the main area,
      // assigning views of this perspective a new identity.
      this._layout = this._perspectiveViewConflictResolver.resolve(currentLayout, this._layout);

      // Add outlets contained in the main area.
      Objects.entries(currentLayout.outlets({mainAreaGrid: true})).forEach(([outlet, segments]) => {
        outlets.set(outlet, segments);
      });
    }

    // Add outlets contained in this perspective.
    Objects.entries(this._layout.outlets({mainGrid: true, activityGrids: true})).forEach(([outlet, segments]) => {
      outlets.set(outlet, segments);
    });

    // Create the layout for this perspective.
    return this._workbenchLayoutFactory.create({
      grids: {
        ...this._layout.grids,
        mainArea: currentLayout.grids.mainArea,
      },
      activityLayout: this._layout.activityLayout,
      perspectiveId: this.id,
      outlets: Object.fromEntries(outlets),
      navigationStates: currentLayout.navigationStates({grid: 'mainArea'}), // preserve navigation state of parts and views in the main area; navigation state of parts and views outside the main area cannot be restored since not persisted.
    });
  }

  /**
   * Creates the initial layout of this perspective as defined in the perspective definition.
   */
  private async createInitialLayout(): Promise<ɵWorkbenchLayout> {
    const initialLayout = await runInInjectionContext(this._perspectiveEnvironmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory)) as ɵWorkbenchLayout;
    return this.ensureActiveView(initialLayout);
  }

  /**
   * Activates the first view of each part if not specified.
   */
  private ensureActiveView(layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    return layout.parts()
      .filter(part => part.views.length)
      .reduce((acc, part) => part.activeViewId ? acc : acc.activateView(part.views[0]!.id), layout);
  }

  /**
   * Sets up automatic persistence of the perspective layout on every layout change.
   */
  private installLayoutPersister(): void {
    const executor = new LatestTaskExecutor();
    const injector = inject(Injector);

    from(this._workbenchLayoutService.whenLayoutAvailable)
      .pipe(
        switchMap(() => toObservable(this._workbenchLayoutService.layout, {injector})),
        skip(1), // Skip immediate layout emission to only persist on layout change.
        filter(() => this.active()),
        takeUntilDestroyed(),
      )
      .subscribe(layout => executor.submit(() => this.storeLayout(layout)));
  }

  /**
   * Loads the layout of this perspective from storage, applying necessary migrations if the layout is outdated.
   * Returns `undefined` if not stored or could not be deserialized.
   */
  private async loadLayout(): Promise<ɵWorkbenchLayout | undefined> {
    if (this.transient) {
      return this._layout;
    }

    const layout = await this._workbenchlayoutStorageService.load(this.id);
    if (!layout) {
      return undefined;
    }

    return this._workbenchLayoutMerger.merge({
      local: this._workbenchLayoutFactory.create({
        grids: {
          main: layout.userLayout.grids.main,
          ...WorkbenchLayouts.pickActivityGrids(layout.userLayout.grids),
        },
        activityLayout: layout.userLayout.activityLayout,
        outlets: layout.userLayout.outlets,
      }),
      base: this._workbenchLayoutFactory.create({
        grids: {
          main: layout.referenceLayout.grids.main,
          ...WorkbenchLayouts.pickActivityGrids(layout.referenceLayout.grids),
        },
        activityLayout: layout.referenceLayout.activityLayout,
        outlets: layout.referenceLayout.outlets,
      }),
      remote: this._initialLayout!,
    });
  }

  /**
   * Stores the layout of this perspective.
   *
   * If an anonymous perspective, only memoizes the layout, but does not write it to storage.
   */
  private async storeLayout(currentLayout: ɵWorkbenchLayout): Promise<void> {
    // Memoize the layout of this perspective.
    this._layout = this._workbenchLayoutFactory.create({
      grids: {
        main: currentLayout.grids.main,
        ...WorkbenchLayouts.pickActivityGrids(currentLayout.grids),
      },
      activityLayout: currentLayout.activityLayout,
      outlets: currentLayout.outlets({mainGrid: true, activityGrids: true}),
    });

    // Do not store the layout if a transient perspective.
    if (this.transient) {
      return;
    }

    const serializedReferenceLayout = this._initialLayout!.serialize();
    const serializedUserLayout = this._layout.serialize();

    await this._workbenchlayoutStorageService.store(this.id, {
      referenceLayout: {
        grids: {
          main: serializedReferenceLayout.grids.main,
          ...WorkbenchLayouts.pickActivityGrids(serializedReferenceLayout.grids),
        },
        activityLayout: serializedReferenceLayout.activityLayout,
        outlets: serializedReferenceLayout.outlets({mainGrid: true, activityGrids: true}),
      },
      userLayout: {
        grids: {
          main: serializedUserLayout.grids.main,
          ...WorkbenchLayouts.pickActivityGrids(serializedUserLayout.grids),
        },
        activityLayout: serializedUserLayout.activityLayout,
        outlets: serializedUserLayout.outlets({mainGrid: true, activityGrids: true}),
      },
    });
  }

  public destroy(): void {
    this._perspectiveEnvironmentInjector.destroy();
  }
}

/**
 * Provides the currently active perspective in the workbench.
 */
export const ACTIVE_PERSPECTIVE = new InjectionToken<Signal<ɵWorkbenchPerspective | undefined>>('ACTIVE_PERSPECTIVE', {
  providedIn: 'root',
  factory: (): Signal<ɵWorkbenchPerspective | undefined> => {
    const layout = inject(WorkbenchLayoutService).layout;
    const workbenchPerspectiveRegistry = inject(WORKBENCH_PERSPECTIVE_REGISTRY);
    const workbenchStartup = inject(WorkbenchStartup);

    return computed(() => {
      // Perspectives are not registered until the workbench startup is complete.
      if (!workbenchStartup.done()) {
        return undefined;
      }

      const perspectiveId = layout().perspectiveId;
      if (!perspectiveId) {
        return undefined; // The initial perspective has not been activated yet.
      }

      return workbenchPerspectiveRegistry.get(perspectiveId);
    });
  },
});
