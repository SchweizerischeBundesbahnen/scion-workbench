/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, provideAppInitializer} from '@angular/core';
import {ɵWorkbenchLauncher} from './ɵworkbench-launcher.service';
import {WorkbenchConfig} from '../workbench-config';

/**
 * Provides the main entry point to start the SCION Workbench.
 *
 * Depending on {@link WorkbenchConfig.startup}, the SCION Workbench starts during application bootstrapping or when the `<wb-workbench>` component is added to the DOM.
 *
 * The application can hook into the startup process of the SCION Workbench by providing one or more initializers to {@link provideWorkbenchInitializer}.
 * Initializers execute at defined points during startup, enabling the application's controlled initialization. The workbench is fully started once
 * all initializers have completed.
 *
 * **Example of registering an initializer:**
 * ```ts
 * import {provideWorkbench, provideWorkbenchInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideWorkbenchInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 *
 * The application can inject {@link WorkbenchStartup} to check if the workbench has completed startup.
 *
 * @see WorkbenchConfig.startup
 * @see provideWorkbench
 * @see provideWorkbenchInitializer
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchLauncher})
export abstract class WorkbenchLauncher {

  /**
   * Starts the SCION Workbench.
   *
   * Calling this method has no effect if the workbench is already starting or has started.
   *
   * @return A Promise that resolves when the workbench has completed the startup or that rejects if the startup failed.
   */
  public abstract launch(): Promise<true>;
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
