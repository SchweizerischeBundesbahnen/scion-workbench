/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { WorkbenchModuleConfig } from '../workbench-module-config';
import { APP_INITIALIZER, ApplicationInitStatus, Inject, Injectable, InjectFlags, InjectionToken, Injector, Optional, Provider } from '@angular/core';
import { WorkbenchInitializer } from './workbench-initializer';
import { Logger, LoggerNames } from '../logging';

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
@Injectable()
export class WorkbenchLauncher {

  private _state: StartupState = StartupState.Stopped;

  constructor(@Optional() @Inject(WorkbenchInitializer) private _workbenchInitializers: WorkbenchInitializer[],
              private _startup: WorkbenchStartup,
              private _logger: Logger,
              private _injector: Injector) {
  }

  /**
   * Launches the SCION Workbench.
   *
   * This method represents the initial entry point that should be called to launch the workbench. The launcher runs
   * registered workbench initializers and waits for them to complete. Calling this method has no effect if the
   * workbench is already starting or has started.
   *
   * When mounting the workbench root component `<wb-workbench>` to the DOM before the workbench startup has finished,
   * the workbench will display a startup splash until completed startup.
   *
   * @return A Promise that resolves when the workbench has completed the startup or that rejects if the startup failed.
   */
  public async launch(): Promise<void> {
    switch (this._state) {
      case StartupState.Stopped: {
        this._logger.debug(() => `Starting Workbench. Waiting for workbench initializers to complete. [launcher=${this._injector.get(ApplicationInitStatus).done ? 'LAZY' : 'APP_INITIALIZER'}]`, LoggerNames.LIFECYCLE);
        this._state = StartupState.Starting;
        if (this._workbenchInitializers) {
          await Promise.all(this._workbenchInitializers
            .filter(initializer => typeof initializer.init === 'function')
            .map(initializer => initializer.init()),
          );
        }
        this._state = StartupState.Started;
        this._injector.get(WORKBENCH_POST_STARTUP, undefined, InjectFlags.Optional);
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
@Injectable()
export class WorkbenchStartup {

  private _started = false;

  /* @internal */
  public notifyStarted: () => void;

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
 * Registers a set of DI providers for launching the workbench.
 */
export function provideWorkbenchLauncher(workbenchModuleConfig: WorkbenchModuleConfig): Provider[] {
  // Angular is very strict when compiling module definitions ahead-of-time (if enabled the AOT compilation).
  // - use ES5 function instead of arrow function to specify the factory
  // - export functions referenced in module metadata definition
  // - use ternary check to conditionally provide a provider
  return [
    WorkbenchLauncher,
    WorkbenchStartup,
    workbenchModuleConfig.startup?.launcher === 'APP_INITIALIZER' ? [
      {
        provide: APP_INITIALIZER,
        useFactory: launchWorkbench,
        multi: true,
        deps: [WorkbenchLauncher],
      },
    ] : [],
  ];
}

/**
 * @docs-private Not public API, intended for internal use only.
 */
export function launchWorkbench(workbenchLauncher: WorkbenchLauncher): () => Promise<void> {
  return () => workbenchLauncher.launch();
}

/**
 * DI token to register services that are to be constructed immediately after the workbench has started.
 */
export const WORKBENCH_POST_STARTUP = new InjectionToken<string>('WORKBENCH_POST_STARTUP');
