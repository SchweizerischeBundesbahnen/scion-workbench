/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';
import {WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {WorkbenchInitializer} from '../startup/workbench-initializer';
import {Logger} from '../logging/logger';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {WorkbenchPerspectiveRegistry} from './workbench-perspective.registry';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';

/**
 * Provides access to perspectives.
 *
 * A perspective defines the layout around the main area, which can be switched independently of the main area.
 * There can only be one perspective active at a time.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveService implements WorkbenchInitializer {

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _perspectiveRegistry: WorkbenchPerspectiveRegistry,
              private _environmentInjector: EnvironmentInjector,
              private _workbenchPerspectiveStorageService: WorkbenchPerspectiveStorageService,
              workbenchStartup: WorkbenchStartup,
              logger: Logger) {
    workbenchStartup.whenStarted
      .then(() => this.activateInitialPerspective())
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

    const perspective = runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchPerspective(definition));
    this._perspectiveRegistry.register(perspective);
  }

  /**
   * Switches to the specified perspective. The main area will not change.
   */
  public async switchPerspective(id: string): Promise<boolean> {
    if (this.activePerspective?.id === id) {
      return true;
    }
    const activated = await this._perspectiveRegistry.get(id).activate();
    if (activated) {
      await this._workbenchPerspectiveStorageService.storeActivePerspectiveId(id);
    }
    return activated;
  }

  /**
   * Resets the currently active perspective to its initial layout. The main area will not change.
   */
  public async resetPerspective(): Promise<void> {
    await this.activePerspective?.reset();
  }

  /**
   * Activates the initial perspective, if any.
   */
  private async activateInitialPerspective(): Promise<void> {
    // Determine the initial perspective.
    const initialPerspectiveId = await (async (): Promise<string | undefined> => {
      // Read initial perspective from storage.
      const storedActivePerspectiveId = await this._workbenchPerspectiveStorageService.loadActivePerspectiveId();
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
   * Returns the currently active perspective, or `null` if there is no current perspective.
   */
  private get activePerspective(): ɵWorkbenchPerspective | null {
    return this._perspectiveRegistry.perspectives.find(perspective => perspective.active) ?? null;
  }
}

/**
 * Identifier for the "synthetic" perspective that the workbench creates if using a workbench layout without configuring perspectives.
 */
const SYNTHETIC_WORKBENCH_PERSPECTIVE_ID = '@scion/workbench/synthetic';
