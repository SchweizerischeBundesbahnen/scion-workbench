/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {ApplicationInitStatus, createEnvironmentInjector, EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {ACTIVE_PERSPECTIVE, ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';
import {WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {WorkbenchInitializer} from '../startup/workbench-initializer';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
import {ANONYMOUS_PERSPECTIVE_ID_PREFIX} from '../workbench.constants';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchConfig} from '../workbench-config';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout.factory';
import {WORKBENCH_PERSPECTIVE_REGISTRY} from './workbench-perspective.registry';

/**
 * Enables registration and activation of perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveService implements WorkbenchInitializer {

  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _perspectiveRegistry = inject(WORKBENCH_PERSPECTIVE_REGISTRY);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _applicationInitStatus = inject(ApplicationInitStatus);
  private readonly _workbenchPerspectiveStorageService = inject(WorkbenchPerspectiveStorageService);

  public readonly activePerspective = inject(ACTIVE_PERSPECTIVE);

  public async init(): Promise<void> {
    await this.registerPerspectivesFromConfig();
    await this.registerAnonymousPerspectiveFromWindowName();
    await this.activateInitialPerspective();
  }

  /**
   * Registers perspectives configured in {@link WorkbenchConfig}.
   */
  private async registerPerspectivesFromConfig(): Promise<void> {
    const layout = this._workbenchConfig.layout;

    // Create perspective from layout (if any).
    if (typeof layout === 'function') {
      await this.registerPerspective({id: DEFAULT_WORKBENCH_PERSPECTIVE_ID, layout});
    }
    // Register configured perspectives (if any).
    else if (layout?.perspectives?.length) {
      for (const perspective of layout.perspectives) {
        await this.registerPerspective(perspective);
      }
    }
    // Register default perspective if no perspective is registered.
    else if (this._perspectiveRegistry.isEmpty()) {
      await this.registerPerspective({id: DEFAULT_WORKBENCH_PERSPECTIVE_ID, layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)});
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

    this._perspectiveRegistry.register(perspectiveId, this.createPerspective(definition));
  }

  private createPerspective(definition: WorkbenchPerspectiveDefinition): ɵWorkbenchPerspective {
    // Construct the handle in an injection context that shares the perspective's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const perspectiveEnvironmentInjector = createEnvironmentInjector([], this._environmentInjector, `Workbench Perspective ${definition.id}`);
    return runInInjectionContext(perspectiveEnvironmentInjector, () => new ɵWorkbenchPerspective(definition));
  }

  /**
   * Switches to the specified perspective. The main area will not change, if any.
   *
   * @param id - Specifies the id of the perspective to activate.
   * @param options - Controls activation of the perspective.
   * @param options.storePerspectiveAsActive - Controls if to store the perspective as the active perspective. Defaults to `true`.
   * @return `true` if activated the perspective, otherwise `false`.
   */
  public async switchPerspective(id: string, options?: {storePerspectiveAsActive?: boolean}): Promise<boolean> {
    if (this.activePerspective()?.id === id) {
      return true;
    }
    const activated = await this._perspectiveRegistry.get(id).activate();
    if (activated && (options?.storePerspectiveAsActive ?? true)) {
      await this._workbenchPerspectiveStorageService.storeActivePerspectiveId(id);
      window.name = generatePerspectiveWindowName(id);
    }
    return activated;
  }

  /**
   * Resets the currently active perspective to its initial layout. The main area will not change.
   */
  public async resetPerspective(): Promise<void> {
    await this.activePerspective()?.reset();
  }

  /**
   * Activates the initial perspective.
   */
  private async activateInitialPerspective(): Promise<void> {
    if (this._perspectiveRegistry.isEmpty()) {
      throw Error('[NullPerspectiveError] No perspective found to activate.');
    }

    const perspectiveId = await this.determineInitialPerspective() ?? this._perspectiveRegistry.objects()[0].id;
    const activation = this.switchPerspective(perspectiveId, {storePerspectiveAsActive: false});

    // Switching perspective blocks until the initial navigation has been performed. By default, Angular performs
    // the initial navigation after running app initializers. Therefore, do not await perspective activation when
    // starting the workbench during app initialization. Otherwise, Angular would never complete app initialization.
    if (this._applicationInitStatus.done as boolean) {
      await activation;
    }
  }

  /**
   * Determines which perspective to activate, with the following precedence:
   *
   * 1. Perspective defined as window name.
   * 2. Perspective defined in storage.
   * 3. Perspective configured in the workbench config.
   */
  private async determineInitialPerspective(): Promise<string | undefined> {
    // Find perspective in window name.
    const perspectiveFromWindow = parsePerspectiveIdFromWindowName();
    if (perspectiveFromWindow && this._perspectiveRegistry.has(perspectiveFromWindow)) {
      return perspectiveFromWindow;
    }

    // Find perspective in storage.
    const perspectiveFromStorage = await this._workbenchPerspectiveStorageService.loadActivePerspectiveId();
    if (perspectiveFromStorage && this._perspectiveRegistry.has(perspectiveFromStorage)) {
      return perspectiveFromStorage;
    }

    // Find perspective in config.
    const perspectiveFromConfig = typeof this._workbenchConfig.layout === 'object' && this._workbenchConfig.layout.initialPerspective;
    if (typeof perspectiveFromConfig === 'string') {
      return perspectiveFromConfig;
    }
    if (typeof perspectiveFromConfig === 'function') {
      return (await runInInjectionContext(this._environmentInjector, () => perspectiveFromConfig([...this._perspectiveRegistry.objects()])));
    }
    return undefined;
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
