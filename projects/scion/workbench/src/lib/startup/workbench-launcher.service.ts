/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchModuleConfig} from '../workbench-module-config';
import {APP_INITIALIZER, ApplicationInitStatus, EnvironmentProviders, inject, Injectable, Injector, makeEnvironmentProviders, NgZone} from '@angular/core';
import {runWorkbenchInitializers, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP} from './workbench-initializer';
import {Logger, LoggerNames} from '../logging';

/**
 * Provides API to launch the SCION Workbench.
 *
 * During workbench startup, the launcher runs registered workbench initializers and waits for them to complete.
 * Workbench initializers may execute in parallel. To register a workbench initializer, provide a class implementing
 * {@link WorkbenchInitializer} as a multi-provider using the DI class token {@link WorkbenchInitializer}.
 *
 * When importing the {@link WorkbenchModule}, you can configure which workbench launching strategy to use.
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
 * {@link WorkbenchModuleConfig#startup#splash}. When launching the workbench in an Angular `APP_INITIALIZER`, no splash will
 * display since the workbench will start upfront.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLauncher {

  private _state: StartupState = StartupState.Stopped;

  constructor(private _startup: WorkbenchStartup,
              private _logger: Logger,
              private _zone: NgZone,
              private _injector: Injector) {
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
  public async launch(): Promise<void> {
    // Ensure to run in the Angular zone to check the workbench for changes even if called from outside the Angular zone, e.g. in unit tests.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.launch());
    }

    switch (this._state) {
      case StartupState.Stopped: {
        this._logger.debug(() => `Starting Workbench. Waiting for workbench initializers to complete. [launcher=${this._injector.get(ApplicationInitStatus).done ? 'LAZY' : 'APP_INITIALIZER'}]`, LoggerNames.LIFECYCLE);
        this._state = StartupState.Starting;
        await runWorkbenchInitializers(WORKBENCH_PRE_STARTUP, this._injector);
        await runWorkbenchInitializers(WORKBENCH_STARTUP, this._injector);
        this._state = StartupState.Started;
        await runWorkbenchInitializers(WORKBENCH_POST_STARTUP, this._injector);
        this._logger.debug(() => 'Workbench started.', LoggerNames.LIFECYCLE);
        this._startup.notifyStarted();
        return Promise.resolve();
      }
      case StartupState.Starting:
      case StartupState.Started: {
        return this._startup.whenStarted;
      }
      default: {
        throw Error(`[WorkbenchStartupError] Illegal startup state: ${this._state}`);
      }
    }
  }
}

enum StartupState {
  Stopped, Starting, Started
}

/**
 * Allows waiting for the workbench startup to complete.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchStartup {

  private _started = false;

  /* @internal */
  public notifyStarted!: () => void;

  /**
   * Promise that resolves when the workbench has completed the startup.
   */
  public readonly whenStarted = new Promise<void>(resolve => this.notifyStarted = () => {
    this._started = true;
    resolve();
  });

  /**
   * Returns whether the workbench completed startup.
   */
  public isStarted(): boolean {
    return this._started;
  }
}

/**
 * Provides a set of DI providers for launching the workbench.
 */
export function provideWorkbenchLauncher(workbenchModuleConfig: WorkbenchModuleConfig): EnvironmentProviders | [] {
  if (workbenchModuleConfig.startup?.launcher !== 'APP_INITIALIZER') {
    return [];
  }

  return makeEnvironmentProviders([{
    provide: APP_INITIALIZER,
    useFactory: () => {
      const launcher = inject(WorkbenchLauncher);
      return () => launcher.launch();
    },
    multi: true,
  }]);
}
