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
import {WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {filter} from 'rxjs/operators';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {LatestTaskExecutor} from '../executor/latest-task-executor';
import {UrlSegment} from '@angular/router';
import {MAIN_AREA} from '../layout/workbench-layout';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_PERSPECTIVE_REGISTRY} from './workbench-perspective.registry';
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {Objects} from '../common/objects.util';

/**
 * @inheritDoc
 */
export class ɵWorkbenchPerspective implements WorkbenchPerspective {

  private readonly _perspectiveEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _workbenchGridMerger = inject(WorkbenchGridMerger);
  private readonly _workbenchPerspectiveStorageService = inject(WorkbenchPerspectiveStorageService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _initialLayoutFn: WorkbenchLayoutFn;
  private readonly _perspectiveViewConflictResolver = inject(WorkbenchPerspectiveViewConflictResolver);

  public readonly id: string;
  public readonly transient: boolean;
  public readonly data: {[key: string]: any};
  public readonly active: Signal<boolean>;

  private _initialPerspectiveLayout: ɵWorkbenchLayout | undefined;
  private _perspectiveLayout: ɵWorkbenchLayout | undefined;

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
    // Create the initial workbench grid when constructed for the first time.
    this._initialPerspectiveLayout ??= await this.createInitialPerspectiveLayout();

    // Load the layout from the storage, if present, or use the initial layout otherwise.
    this._perspectiveLayout = (await this.loadPerspectiveLayout()) ?? this._initialPerspectiveLayout;

    // Perform navigation to activate the layout of this perspective.
    return this._workbenchRouter.navigate(currentLayout => this.createLayoutForActivation(currentLayout));
  }

  /**
   * Resets this perspective to its initial layout.
   */
  public async reset(): Promise<void> {
    this._perspectiveLayout = this._initialPerspectiveLayout;

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
    if (!this._perspectiveLayout) {
      throw Error(`[PerspectiveActivateError] Perspective '${this.id}' not constructed.`);
    }

    // Outlets of the new layout.
    const outlets = new Map<string, UrlSegment[]>();

    // Add outlets of the main area and resolve conflicts if any.
    if (currentLayout.hasPart(MAIN_AREA, {grid: 'workbench'}) && this._perspectiveLayout.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      // Detect and resolve id clashes between views defined by this perspective and views contained in the main area,
      // assigning views of this perspective a new identity.
      this._perspectiveLayout = this._perspectiveViewConflictResolver.resolve(currentLayout, this._perspectiveLayout);

      // Add outlets contained in the main area.
      Objects.entries(currentLayout.outlets({grid: 'mainArea'})).forEach(([outlet, segments]) => {
        outlets.set(outlet, segments);
      });
    }

    // Add outlets contained in this perspective.
    Objects.entries(this._perspectiveLayout.outlets()).forEach(([outlet, segments]) => {
      outlets.set(outlet, segments);
    });

    // Create the layout for this perspective.
    return this._workbenchLayoutFactory.create({
      workbenchGrid: this._perspectiveLayout.workbenchGrid,
      mainAreaGrid: currentLayout.mainAreaGrid,
      perspectiveId: this.id,
      outlets: Object.fromEntries(outlets),
      navigationStates: currentLayout.navigationStates({grid: 'mainArea'}), // preserve navigation state of parts and views in the main area; navigation state of parts and views outside the main area cannot be restored since not persisted.
      maximized: undefined, // Do not preserve maximized state when switching between perspectives.
    });
  }

  /**
   * Creates the initial layout of this perspective as defined in the perspective definition.
   */
  private async createInitialPerspectiveLayout(): Promise<ɵWorkbenchLayout> {
    const initialLayout = await runInInjectionContext(this._perspectiveEnvironmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory)) as ɵWorkbenchLayout;
    return this.ensureActiveView(initialLayout);
  }

  /**
   * Activates the first view of each part if not specified.
   */
  private ensureActiveView(layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    return layout.parts()
      .filter(part => part.views.length)
      .reduce((acc, part) => part.activeViewId ? acc : acc.activateView(part.views[0].id), layout);
  }

  /**
   * Sets up automatic persistence of the perspective layout on every layout change.
   */
  private installLayoutPersister(): void {
    const executor = new LatestTaskExecutor();

    this._workbenchLayoutService.onLayoutChange$
      .pipe(
        filter(() => this.active()),
        takeUntilDestroyed(),
      )
      .subscribe(layout => {
        executor.submit(() => this.storePerspectiveLayout(layout));
      });
  }

  /**
   * Loads the layout of this perspective from storage, applying necessary migrations if the layout is outdated.
   * Returns `null` if not stored or could not be deserialized.
   */
  private async loadPerspectiveLayout(): Promise<ɵWorkbenchLayout | null> {
    if (this.transient) {
      return this._perspectiveLayout ?? null;
    }

    const perspectiveLayout = await this._workbenchPerspectiveStorageService.loadPerspectiveLayout(this.id);
    if (!perspectiveLayout) {
      return null;
    }

    return this._workbenchGridMerger.merge({
      local: this._workbenchLayoutFactory.create({
        workbenchGrid: perspectiveLayout.userLayout.workbenchGrid,
        outlets: perspectiveLayout.userLayout.outlets,
      }),
      base: this._workbenchLayoutFactory.create({
        workbenchGrid: perspectiveLayout.referenceLayout.workbenchGrid,
        outlets: perspectiveLayout.referenceLayout.outlets,
      }),
      remote: this._initialPerspectiveLayout!,
    });
  }

  /**
   * Stores the layout of this perspective.
   *
   * If an anonymous perspective, only memoizes the layout, but does not write it to storage.
   */
  private async storePerspectiveLayout(currentLayout: ɵWorkbenchLayout): Promise<void> {
    // Memoize the layout of this perspective.
    this._perspectiveLayout = this._workbenchLayoutFactory.create({
      workbenchGrid: currentLayout.workbenchGrid,
      outlets: currentLayout.outlets({grid: 'workbench'}),
    });

    // Do not store the layout if a transient perspective.
    if (this.transient) {
      return;
    }

    const serializedReferenceLayout = this._initialPerspectiveLayout!.serialize();
    const serializedUserLayout = this._perspectiveLayout.serialize();

    await this._workbenchPerspectiveStorageService.storePerspectiveLayout(this.id, {
      referenceLayout: {
        workbenchGrid: serializedReferenceLayout.workbenchGrid,
        outlets: serializedReferenceLayout.workbenchOutlets,
      },
      userLayout: {
        workbenchGrid: serializedUserLayout.workbenchGrid,
        outlets: serializedUserLayout.workbenchOutlets,
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
    const workbenchLayoutService = inject(WorkbenchLayoutService);
    const workbenchPerspectiveRegistry = inject(WORKBENCH_PERSPECTIVE_REGISTRY);
    const workbenchStartup = inject(WorkbenchStartup);

    return computed(() => {
      // Perspectives are not registered until the workbench startup is complete.
      if (!workbenchStartup.isStarted()) {
        return undefined;
      }

      const perspectiveId = workbenchLayoutService.layout()?.perspectiveId;
      if (!perspectiveId) {
        return undefined; // The initial perspective has not been activated yet.
      }

      return workbenchPerspectiveRegistry.get(perspectiveId);
    });
  },
});
