/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {EnvironmentInjector, Injectable, OnDestroy, runInInjectionContext} from '@angular/core';
import {Router} from '@angular/router';
import {WorkbenchNavigation, WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchPerspectiveViewConflictResolver} from './workbench-perspective-view-conflict-resolver.service';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {RouterUtils} from '../routing/router.util';
import {WorkbenchPerspectiveDefinition, ɵStoredPerspectiveData} from './workbench-perspective.model';
import {WorkbenchInitializer} from '../startup/workbench-initializer';
import {Logger} from '../logging/logger';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {Subject} from 'rxjs';
import {WorkbenchLayoutSerializer} from '../layout/workench-layout-serializer.service';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {takeUntil} from 'rxjs/operators';
import {WorkbenchStorageService} from '../storage/workbench-storage.service';
import {Dictionary} from '@scion/toolkit/util';
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {WorkbenchPerspectiveRegistry} from './workbench-perspective.registry';

/**
 * Provides access to perspectives.
 *
 * A perspective defines the layout around the main area, which can be switched independently of the main area.
 * There can only be one perspective active at a time.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveService implements WorkbenchInitializer, OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _perspectiveRegistry: WorkbenchPerspectiveRegistry,
              private _workbenchRouter: WorkbenchRouter,
              private _router: Router,
              private _perspectiveViewConflictResolver: WorkbenchPerspectiveViewConflictResolver,
              private _environmentInjector: EnvironmentInjector,
              private _workbenchLayoutFactory: WorkbenchLayoutFactory,
              private _workbenchStorageService: WorkbenchStorageService,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchLayoutSerializer: WorkbenchLayoutSerializer,
              workbenchStartup: WorkbenchStartup,
              logger: Logger) {
    workbenchStartup.whenStarted
      .then(() => this.activateInitialPerspective())
      .then(() => this.installStorageSynchronizer())
      .catch(error => logger.error(() => 'Failed to initialize perspectives', error));
  }

  public async init(): Promise<void> {
    await this.registerPerspectivesFromModuleConfig();
  }

  /**
   * Registers perspectives configured in {@link WorkbenchModuleConfig}.
   */
  private async registerPerspectivesFromModuleConfig(): Promise<void> {
    const layoutConfig = this._workbenchModuleConfig.layout;
    if (!layoutConfig) {
      return;
    }

    // Register perspective either from function or object config.
    if (typeof layoutConfig === 'function') {
      await this.registerPerspective({id: SYNTHETIC_WORKBENCH_PERSPECTIVE_ID, layout: layoutConfig});
    }
    else {
      for (const perspective of layoutConfig.perspectives) {
        await this.registerPerspective(perspective);
      }
    }
  }

  /**
   * Registers the given perspective to arrange views around the main area.
   */
  public async registerPerspective(definition: WorkbenchPerspectiveDefinition): Promise<void> {
    const perspectiveId = definition.id;

    if (this._perspectiveRegistry.get(perspectiveId, {orElse: null}) !== null) {
      throw Error(`Failed to register perspective '${perspectiveId}'. Another perspective is already registered under that identity.`);
    }
    if (definition.canActivate && !(await runInInjectionContext(this._environmentInjector, () => definition.canActivate!()))) {
      return;
    }

    const storedPerspectiveData: Dictionary<ɵStoredPerspectiveData> | null = this._workbenchStorageService.get(PERSPECTIVES_STORAGE_KEY);
    const perspective = runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchPerspective(definition, storedPerspectiveData?.[perspectiveId]));
    this._perspectiveRegistry.register(perspective);
  }

  /**
   * Switches to the specified perspective. The main area will not change.
   */
  public async switchPerspective(id: string): Promise<boolean> {
    const activePerspective = this.getActivePerspective();
    if (activePerspective?.id === id) {
      return true;
    }
    const perspective = this._perspectiveRegistry.get(id);

    // Memoize layout and outlets of the active perspective.
    this.memoizeActivePerspectiveLayout();

    // Construct the perspective when it is activated for the first time.
    if (!perspective.constructed) {
      await perspective.construct();
    }

    const success = await this._workbenchRouter.ɵnavigate(currentLayout => {
      activePerspective?.activate(false);
      perspective.activate(true);
      return this.createPerspectiveActivationNavigation(currentLayout, perspective);
    });
    if (!success) {
      activePerspective?.activate(true);
      perspective.activate(false);
      return false;
    }

    return true;
  }

  /**
   * Resets the currently active perspective to its initial layout. The main area will not change.
   */
  public async resetPerspective(): Promise<void> {
    const activePerspective = this.getActivePerspective();
    if (!activePerspective) {
      throw Error('[WorkbenchPerspectiveError] Failed to reset perspective. No active perspective found.');
    }

    await activePerspective.reset();
    const reset = await this._workbenchRouter.ɵnavigate(currentLayout => this.createPerspectiveActivationNavigation(currentLayout, activePerspective));
    if (!reset) {
      throw Error(`[WorkbenchPerspectiveError] Failed to reset perspective '${activePerspective.id}.`);
    }
  }

  /**
   * Creates the {@link WorkbenchNavigation} object to activate given perspective.
   *
   * When switching to another perspective, name clashes between the views contained in the perspective
   * and the views contained in the main area are possible. This navigation detects and resolves name conflicts,
   * changing the specified {@link WorkbenchPerspective} object if necessary.
   *
   * @param currentLayout - Specifies the current layout.
   * @param perspective - Specifies the perspective to activate.
   */
  private createPerspectiveActivationNavigation(currentLayout: ɵWorkbenchLayout, perspective: ɵWorkbenchPerspective): WorkbenchNavigation {
    // Resolve name clashes between views defined by the perspective and views contained in the main area.
    this._perspectiveViewConflictResolver.resolve(currentLayout.mainGrid, perspective);

    return {
      layout: this._workbenchLayoutFactory.create({mainGrid: currentLayout.mainGrid, peripheralGrid: perspective.grid}),
      viewOutlets: {
        // Remove outlets of current perspective from the URL.
        ...RouterUtils.outletsFromCurrentUrl(this._router, currentLayout.views({scope: 'peripheral'}).map(view => view.id), () => null),
        // Add outlets of the perspective to activate to the URL.
        ...perspective.viewOutlets,
      },
    };
  }

  /**
   * Activates the initial perspective, if any.
   */
  private async activateInitialPerspective(): Promise<void> {
    // Determine the initial perspective.
    const initialPerspectiveId = await (async (): Promise<string | undefined> => {
      // Read initial perspective from storage.
      const storedActivePerspectiveId = this._workbenchStorageService.get<string>(ACTIVE_PERSPECTIVE_ID_STORAGE_KEY);
      if (storedActivePerspectiveId && this._perspectiveRegistry.get(storedActivePerspectiveId, {orElse: null}) !== null) {
        return storedActivePerspectiveId;
      }

      // Read initial perspective from config.
      const layout = this._workbenchModuleConfig.layout;
      const initialPerspective = typeof layout === 'object' ? layout.initialPerspective : null;
      if (!initialPerspective) {
        return this._perspectiveRegistry.perspectives[0]?.id;
      }
      if (typeof initialPerspective === 'string') {
        return initialPerspective;
      }
      if (typeof initialPerspective === 'function') {
        return (await runInInjectionContext(this._environmentInjector, () => initialPerspective([...this._perspectiveRegistry.perspectives])))?.id;
      }
      return undefined;
    })();

    // Select initial perspective.
    if (initialPerspectiveId) {
      await this.switchPerspective(initialPerspectiveId);
    }
  }

  /**
   * Memoizes layout and outlets of the active perspective, if any.
   */
  private memoizeActivePerspectiveLayout(): void {
    const activePerspective = this.getActivePerspective();
    if (!activePerspective) {
      return;
    }

    const currentLayout = this._workbenchLayoutService.layout!;
    activePerspective.grid = currentLayout.peripheralGrid;
    activePerspective.viewOutlets = RouterUtils.outletsFromCurrentUrl(this._router, currentLayout.views({scope: 'peripheral'}).map(view => view.id));
  }

  /**
   * Returns the currently active perspective, or `null` if there is no current perspective.
   */
  private getActivePerspective(): ɵWorkbenchPerspective | null {
    return this._perspectiveRegistry.perspectives.find(perspective => perspective.active) ?? null;
  }

  /**
   * Installs the synchronizer to update the storage on layout change.
   */
  private installStorageSynchronizer(): void {
    this._workbenchLayoutService.layout$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        // Memoize layout and outlets of the active perspective.
        this.memoizeActivePerspectiveLayout();

        // Collect data to be stored.
        const storedPerspectiveData: Dictionary<ɵStoredPerspectiveData> = this._workbenchStorageService.get(PERSPECTIVES_STORAGE_KEY) ?? {};
        this._perspectiveRegistry.perspectives
          .filter(perspective => perspective.constructed)
          .forEach(perspective => {
            storedPerspectiveData[perspective.id] = {
              initialPeripheralGrid: this._workbenchLayoutSerializer.serialize(perspective.initialGrid!, {nullIfEmpty: true}),
              actualPeripheralGrid: this._workbenchLayoutSerializer.serialize(perspective.grid!, {nullIfEmpty: true}),
              viewOutlets: perspective.viewOutlets,
            };
          });

        this._workbenchStorageService.set(PERSPECTIVES_STORAGE_KEY, storedPerspectiveData);
        this._workbenchStorageService.set(ACTIVE_PERSPECTIVE_ID_STORAGE_KEY, this.getActivePerspective()?.id);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Key to associate perspective data in the workbench storage.
 */
const PERSPECTIVES_STORAGE_KEY = 'perspectives';

/**
 * Key to associate the active perspective in the workbench storage.
 */
const ACTIVE_PERSPECTIVE_ID_STORAGE_KEY = 'activePerspectiveId';

/**
 * Identifier for the "synthetic" perspective that the workbench creates if using a workbench layout without configuring perspectives.
 */
const SYNTHETIC_WORKBENCH_PERSPECTIVE_ID = '@scion/workbench/synthetic';
