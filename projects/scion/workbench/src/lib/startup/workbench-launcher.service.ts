/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchConfig} from '../workbench-config';
import {ApplicationInitStatus, assertNotInReactiveContext, EnvironmentProviders, inject, Injectable, Injector, makeEnvironmentProviders, NgZone, provideAppInitializer, signal} from '@angular/core';
import {runWorkbenchInitializers, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP} from './workbench-initializer';
import {Logger, LoggerNames} from '../logging';

/**
 * Provides API to launch the SCION Workbench.
 *
 * During workbench startup, the launcher runs registered workbench initializers and waits for them to complete.
 * Workbench initializers may execute in parallel. To register a workbench initializer, provide a class implementing
 * {@link WorkbenchInitializer} as a multi-provider using the DI class token {@link WorkbenchInitializer}.
 *
 * The SCION Workbench supports the following launchers:
 *
 *  - **APP_INITIALIZER**
 *   Launches the workbench in an Angular `APP_INITIALIZER`, which is before bootstrapping the app component.
 *
 * - **LAZY** (which is the default)
 *   Launches the workbench at the latest when bootstrapping the workbench root component `<wb-workbench>`.
 *
 *   With this strategy, you are flexible when to start the workbench. You can start the workbench explicitly by
 *   calling {@link WorkbenchLauncher#launch}, e.g., to launch the workbench from a route guard or app initializer,
 *   or start it automatically when adding the workbench root component `<wb-workbench>` to the Angular component
 *   tree.
 *
 * The workbench component displays a startup splash until completed startup. You can configure a custom splash in
 * {@link WorkbenchConfig#startup#splash}. When launching the workbench in an Angular `APP_INITIALIZER`, no splash will
 * display since the workbench will start upfront.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLauncher {

  private readonly _startup = inject(WorkbenchStartup);
  private readonly _logger = inject(Logger);
  private readonly _zone = inject(NgZone);
  private readonly _injector = inject(Injector);

  private _state: StartupState = StartupState.Stopped;

  constructor() {
    const workbenchConfig = inject(WorkbenchConfig, {optional: true});
    if (!workbenchConfig) {
      throw Error(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
    }
  }

  /**
   * Launches the SCION Workbench.
   *
   * This method represents the initial entry point that should be called to launch the workbench. The launcher runs
   * registered workbench initializers and waits for them to complete. Calling this method has no effect if the workbench
   * is already starting or has started.
   *
   * ### Splash
   * When mounting the workbench root component `<wb-workbench>` to the DOM before the workbench startup has finished,
   * the workbench will display a startup splash until completed startup.
   *
   * ### Startup Lifecycle Hooks
   * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
   * Hooks are called at defined points during startup, enabling the application's controlled initialization.
   *
   * The application can associate one or more initializers with any of these DI tokens. An initializer can be any object and is to
   * be provided as a multi-provider. If the initializer is a function or instance of {@link WorkbenchInitializer} and returns a Promise,
   * the workbench waits for the Promise to be resolved before proceeding with the startup. Initializers can call `inject` to get any
   * required dependencies. Initializers associated with the same DI token may run in parallel.
   *
   * Following DI tokens are available as hooks into the workbench's startup process, listed in the order in which they are injected and
   * executed.
   *
   * - {@link WORKBENCH_PRE_STARTUP}
   * - {@link WORKBENCH_STARTUP}
   * - {@link MICROFRONTEND_PLATFORM_PRE_STARTUP}
   * - {@link MICROFRONTEND_PLATFORM_POST_STARTUP}
   * - {@link WORKBENCH_POST_STARTUP}
   *
   * ### Example of how to hook into the startup process.
   *
   * ```ts
   * {
   *   provide: WORKBENCH_STARTUP,
   *   multi: true,
   *   useValue: () => inject(Initializer).init(),
   * }
   * ```
   *
   * @return A Promise that resolves when the workbench has completed the startup or that rejects if the startup failed.
   */
  public async launch(): Promise<true> {
    assertNotInReactiveContext(this.launch, 'Call WorkbenchLauncher.launch() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in the Angular zone to check the workbench for changes even if called from outside the Angular zone, e.g. in unit tests.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.launch());
    }

    switch (this._state) {
      case StartupState.Stopped: {
        this._logger.debug(() => `Starting Workbench. Waiting for workbench initializers to complete. [launcher=${this._injector.get(ApplicationInitStatus).done as boolean ? 'LAZY' : 'APP_INITIALIZER'}]`, LoggerNames.LIFECYCLE);
        this._state = StartupState.Starting;
        await runWorkbenchInitializers(WORKBENCH_PRE_STARTUP, this._injector);
        await runWorkbenchInitializers(WORKBENCH_STARTUP, this._injector);
        this._state = StartupState.Started;
        await runWorkbenchInitializers(WORKBENCH_POST_STARTUP, this._injector);
        this._logger.debug(() => 'Workbench started.', LoggerNames.LIFECYCLE);
        this._startup.notifyStarted();
        return this._startup.whenStarted;
      }
      case StartupState.Starting:
      case StartupState.Started: {
        return this._startup.whenStarted;
      }
    }
  }
}

enum StartupState {
  Stopped, Starting, Started,
}

/**
 * Allows waiting for the workbench startup to complete.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchStartup {

  /**
   * Signals when the workbench completed startup.
   */
  public readonly isStarted = signal(false);

  /* @internal */
  public notifyStarted!: () => void;

  /**
   * Promise that resolves when the workbench has completed the startup.
   */
  public readonly whenStarted = new Promise<true>(resolve => this.notifyStarted = () => {
    this.isStarted.set(true);
    resolve(true);
  });
}

/**
 * Provides a set of DI providers for launching the workbench.
 */
export function provideWorkbenchLauncher(workbenchConfig: WorkbenchConfig): EnvironmentProviders | [] {
  if (workbenchConfig.startup?.launcher !== 'APP_INITIALIZER') {
    return [];
  }

  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(WorkbenchLauncher).launch()),
  ]);
}
