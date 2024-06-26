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
import {WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {filter, map} from 'rxjs/operators';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {serializeExecution} from '../common/operators';
import {UrlSegment} from '@angular/router';
import {MAIN_AREA} from '../layout/workbench-layout';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  private _workbenchRouter = inject(ɵWorkbenchRouter);
  private _environmentInjector = inject(EnvironmentInjector);
  private _initialLayoutFn: WorkbenchLayoutFn;
  private _activePerspectiveId$ = inject(ACTIVE_PERSPECTIVE_ID$);
  private _perspectiveViewConflictResolver = inject(WorkbenchPerspectiveViewConflictResolver);
  private _destroyRef = new ɵDestroyRef();

  private _initialPerspectiveLayout: ɵWorkbenchLayout | undefined;
  private _perspectiveLayout: ɵWorkbenchLayout | undefined;

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
    this.onPerspectiveLayoutChange(layout => this.storePerspectiveLayout(layout));
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
    const navigated = await this._workbenchRouter.navigate(currentLayout => {
      // Mark this perspective as active after the initial navigation (1) but before the actual Angular routing (2).
      //
      // (1) Otherwise, if the initial navigation is asynchronous, such as when lazy loading components or using asynchronous guards,
      //     the activation of the initial perspective would apply the "default" grid with only the main area.
      // (2) Enables routes to evaluate the active perspective in a `canMatch` guard, e.g., to display a perspective-specific start page.
      this._activePerspectiveId$.next(this.id);

      // Create layout with the workbench grid of this perspective and the main area of the current layout.
      return this.createLayoutForActivation(currentLayout);
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

    // Reset to the initial layout.
    await this._workbenchRouter.navigate(currentLayout => this.createLayoutForActivation(currentLayout));
  }

  /**
   * Creates layout with the workbench grid of this perspective and the main area of the current layout.
   *
   * When switching perspective, id clashes between the views contained in the perspective and the
   * views contained in the main area are possible. The activation detects and resolves conflicts,
   * changing the layout of this perspective if necessary.
   */
  private createLayoutForActivation(currentLayout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    if (!this._perspectiveLayout) {
      throw Error(`[PerspectiveActivateError] Perspective '${this.id}' not constructed.`);
    }

    // View outlets of the new layout.
    const viewOutlets = new Map<string, UrlSegment[]>();

    // Detect and resolve id clashes between views defined by this perspective and views contained in the main area,
    // assigning views of this perspective a new identity.
    if (currentLayout.hasPart(MAIN_AREA, {grid: 'workbench'}) && this._perspectiveLayout.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      this._perspectiveLayout = this._perspectiveViewConflictResolver.resolve(currentLayout, this._perspectiveLayout);
    }

    // Add view outlets of views contained in the main area.
    if (currentLayout.hasPart(MAIN_AREA, {grid: 'workbench'}) && this._perspectiveLayout.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      Object.entries(currentLayout.viewOutlets({grid: 'mainArea'})).forEach(([viewId, segments]) => {
        viewOutlets.set(viewId, segments);
      });
    }

    // Add view outlets of views contained in this perspective.
    Object.entries(this._perspectiveLayout.viewOutlets()).forEach(([viewId, segments]) => {
      viewOutlets.set(viewId, segments);
    });

    // Create the layout for this perspective.
    return this._workbenchLayoutFactory.create({
      workbenchGrid: this._perspectiveLayout.workbenchGrid,
      mainAreaGrid: currentLayout.mainAreaGrid,
      viewOutlets: Object.fromEntries(viewOutlets),
      viewStates: currentLayout.viewStates({grid: 'mainArea'}), // preserve view state of views in main area; view state of perspective cannot be restored since not persisted
      // Do not preserve maximized state when switching between perspectives.
    });
  }

  public get active(): boolean {
    return this._activePerspectiveId$.value === this.id;
  }

  /**
   * Creates the initial layout of this perspective as defined in the perspective definition.
   */
  private async createInitialPerspectiveLayout(): Promise<ɵWorkbenchLayout> {
    const initialLayout = await runInInjectionContext(this._environmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory)) as ɵWorkbenchLayout;
    return this.ensureActiveView(initialLayout);
  }

  /**
   * Activates the first view of each part if not specified.
   */
  private ensureActiveView(layout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    return layout.parts()
      .filter(part => part.views?.length)
      .reduce((acc, part) => part.activeViewId ? acc : acc.activateView(part.views[0].id), layout);
  }

  /**
   * Subscribes to workbench layout changes, invoking the given callback on layout change, but only if this perspective is active.
   */
  private onPerspectiveLayoutChange(callback: (layout: ɵWorkbenchLayout) => Promise<void>): void {
    this._workbenchLayoutService.layout$
      .pipe(
        filter(() => this.active),
        serializeExecution(callback),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
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
        viewOutlets: perspectiveLayout.userLayout.viewOutlets,
      }),
      base: this._workbenchLayoutFactory.create({
        workbenchGrid: perspectiveLayout.referenceLayout.workbenchGrid,
        viewOutlets: perspectiveLayout.referenceLayout.viewOutlets,
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
      viewOutlets: currentLayout.viewOutlets({grid: 'workbench'}),
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
        viewOutlets: serializedReferenceLayout.workbenchViewOutlets,
      },
      userLayout: {
        workbenchGrid: serializedUserLayout.workbenchGrid,
        viewOutlets: serializedUserLayout.workbenchViewOutlets,
      },
    });
  }

  public destroy(): void {
    this._destroyRef.destroy();
  }
}
