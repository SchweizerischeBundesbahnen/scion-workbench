/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {EnvironmentInjector, Inject, Injectable, runInInjectionContext} from '@angular/core';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';
import {WorkbenchLayoutFn, WorkbenchPerspectiveDefinition, WorkbenchPerspectives} from './workbench-perspective.model';
import {WorkbenchInitializer} from '../startup/workbench-initializer';
import {Logger} from '../logging/logger';
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {WorkbenchPerspectiveRegistry} from './workbench-perspective.registry';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {WORKBENCH_LAYOUT_CONFIG} from '../workbench.constants';
import {ANONYMOUS_PERSPECTIVE_ID_PREFIX} from '../workbench.constants';
import {MAIN_AREA} from '../layout/workbench-layout';

/**
 * Enables registration and activation of perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveService implements WorkbenchInitializer {

  constructor(@Inject(WORKBENCH_LAYOUT_CONFIG) private _layoutConfig: WorkbenchLayoutFn | WorkbenchPerspectives,
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
    await this.registerAnonymousPerspectiveFromWindowName();
  }

  /**
   * Registers perspectives configured in {@link WorkbenchModuleConfig}.
   */
  private async registerPerspectivesFromModuleConfig(): Promise<void> {
    // Register perspective either from function or object config.
    if (typeof this._layoutConfig === 'function') {
      await this.registerPerspective({id: DEFAULT_WORKBENCH_PERSPECTIVE_ID, layout: this._layoutConfig});
    }
    else {
      for (const perspective of this._layoutConfig.perspectives) {
        await this.registerPerspective(perspective);
      }
    }
  }

  /**
   * Registers an anonymous perspective if the window name indicates it.
   * The perspective is marked transient, with its layout only memoized, not persisted.
   */
  private async registerAnonymousPerspectiveFromWindowName(): Promise<void> {
    const windowPerspectiveId = parsePerspectiveIdFromWindowName();
    if (windowPerspectiveId?.startsWith(ANONYMOUS_PERSPECTIVE_ID_PREFIX)) {
      await this.registerPerspective({
        id: windowPerspectiveId,
        layout: factory => factory.addPart(MAIN_AREA),
        transient: true,
      });
    }
  }

  /**
   * Registers the given perspective to arrange views around the main area.
   */
  public async registerPerspective(definition: WorkbenchPerspectiveDefinition): Promise<void> {
    const perspectiveId = definition.id;

    if (this._perspectiveRegistry.has(perspectiveId)) {
      throw Error(`Failed to register perspective '${perspectiveId}'. Another perspective is already registered under that identity.`);
    }
    if (definition.canActivate && !(await runInInjectionContext(this._environmentInjector, () => definition.canActivate!()))) {
      return;
    }

    const perspective = runInInjectionContext(this._environmentInjector, () => new ɵWorkbenchPerspective(definition));
    this._perspectiveRegistry.register(perspective);
  }

  /**
   * Switches to the specified perspective. The main area will not change, if any.
   */
  public async switchPerspective(id: string): Promise<boolean> {
    if (this.activePerspective?.id === id) {
      return true;
    }
    const activated = await this._perspectiveRegistry.get(id).activate();
    if (activated) {
      await this._workbenchPerspectiveStorageService.storeActivePerspectiveId(id);
      window.name = generatePerspectiveWindowName(id);
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
      // Determine the initial perspective using information from the window name.
      const perspectiveFromWindow = parsePerspectiveIdFromWindowName();
      if (perspectiveFromWindow && this._perspectiveRegistry.has(perspectiveFromWindow)) {
        return perspectiveFromWindow;
      }

      // Determine the initial perspective using information from the storage.
      const perspectiveFromStorage = await this._workbenchPerspectiveStorageService.loadActivePerspectiveId();
      if (perspectiveFromStorage && this._perspectiveRegistry.has(perspectiveFromStorage)) {
        return perspectiveFromStorage;
      }

      // Determine the initial perspective using information from the config.
      const perspectiveFromConfig = typeof this._layoutConfig === 'object' ? this._layoutConfig.initialPerspective : null;
      if (!perspectiveFromConfig) {
        return this._perspectiveRegistry.perspectives[0]?.id;
      }
      if (typeof perspectiveFromConfig === 'string') {
        return perspectiveFromConfig;
      }
      if (typeof perspectiveFromConfig === 'function') {
        return (await runInInjectionContext(this._environmentInjector, () => perspectiveFromConfig([...this._perspectiveRegistry.perspectives])))?.id;
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
 * Identifier for the "default" perspective that the workbench creates if not providing a named layout.
 */
const DEFAULT_WORKBENCH_PERSPECTIVE_ID = 'default';

/**
 * Generates the window name for given perspective to control which perspective to display in a window.
 */
export function generatePerspectiveWindowName(perspectiveId: string): string {
  return `scion.workbench.perspective.${perspectiveId}`;
}

/**
 * Parses the perspective identity from the window name, returning `null` if not set.
 */
function parsePerspectiveIdFromWindowName(): string | null {
  const windowNameRegex = new RegExp(`^${generatePerspectiveWindowName('(?<perspective>.+)')}$`);
  return window.name.match(windowNameRegex)?.groups!['perspective'] ?? null;
}
