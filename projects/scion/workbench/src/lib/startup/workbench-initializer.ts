/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectFlags, InjectionToken, Injector } from '@angular/core';

/**
 * A DI token for providing one or more workbench startup initializers.
 *
 * Initializers registered under this DI token are injected and executed immediately when calling {@link WorkbenchLauncher#launch}.
 * After all initializers associated with this DI token have completed, the workbench transitions into the "started" state.
 * The workbench by itself also bootstraps in an initializer associated with this DI token.
 */
export const WORKBENCH_STARTUP = new InjectionToken<string>('WORKBENCH_STARTUP');

/**
 * A DI token for providing one or more workbench startup initializers.
 *
 * Initializers registered under this DI token are injected and executed just before the SCION Microfrontend Platform installs activator
 * microfrontends. At this point, the host app is connected to the SCION Microfrontend Platform and client-side messaging is enabled,
 * hence this is the place where intent and message handlers can be installed.
 */
export const MICROFRONTEND_PLATFORM_PRE_ACTIVATION = new InjectionToken<string>('MICROFRONTEND_PLATFORM_PRE_ACTIVATION');

/**
 * A DI token for providing one or more workbench startup initializers.
 *
 * Initializers registered under this DI token are injected and executed just before the {@link WorkbenchLauncher} completes the workbench
 * startup, that is, after all initializers associated with the {@link WORKBENCH_STARTUP} DI token have completed initialization.
 */
export const WORKBENCH_POST_STARTUP = new InjectionToken<string>('WORKBENCH_POST_STARTUP');

/**
 * Allows initializing the application during workbench startup.
 *
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * The application can associate one or more initializers with any of these DI tokens. An initializer can be any object and is to be
 * provided by a multi-provider. If the initializer implements the interface {@link WorkbenchInitializer}, which defines a single
 * method, `init`, the workbench waits for its returned Promise to resolve before proceeding with the startup. Initializers associated
 * with the same DI token may run in parallel.
 *
 * Following DI tokens are available as hooks into the workbench's startup process, listed in the order in which they are injected and
 * executed.
 *
 * - {@link WORKBENCH_STARTUP}
 * - {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION}
 * - {@link WORKBENCH_POST_STARTUP}
 *
 * ### Example of how to associate an initializer with the DI token {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION}.
 *
 * ```typescript
 * @NgModule({
 *   ...
 *   providers: [
 *     {
 *       provide: MICROFRONTEND_PLATFORM_PRE_ACTIVATION,
 *       multi: true,
 *       useClass: AppInitializer,
 *     }
 *   ]
 * })
 * export class AppModule {}
 *
 * @Injectable()
 * export class AppInitializer implements WorkbenchInitializer {
 *
 *   public init(): Promise<void> {
 *     ...
 *   }
 * }
 * ```
 */
export interface WorkbenchInitializer {

  /**
   * This method is called during the startup of the workbench.
   *
   * For detailed information about when this method is called, refer to the documentation
   * of the DI token under which this initializer is registered. Note that initializers
   * registered under the same DI token may execute in parallel.
   *
   * @return A Promise blocking startup until it resolves.
   */
  init(): Promise<void>;
}

/**
 * Runs workbench initializers associated with the given DI token.
 */
export async function runWorkbenchInitializers(token: InjectionToken<any>, injector: Injector): Promise<void> {
  const initializers: WorkbenchInitializer[] = injector.get(token, undefined, InjectFlags.Optional) as WorkbenchInitializer[];
  if (!initializers || !initializers.length) {
    return;
  }
  await Promise.all(initializers
    .filter(initializer => typeof initializer.init === 'function')
    .map(initializer => initializer.init()));
}

