/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectFlags, InjectionToken, Injector} from '@angular/core';

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed immediately when calling {@link WorkbenchLauncher#launch}.
 * After all initializers associated with this DI token have completed, the workbench transitions into the "started" state.
 *
 * If microfrontend support is enabled, the workbench starts the "SCION Microfrontend Platform" in this lifecycle hook. Therefore,
 * you should not register hooks that depend on a running platform under this DI token. To interact with the platform, use the
 * lifecycle hook {@link MICROFRONTEND_PLATFORM_POST_STARTUP} instead.
 */
export const WORKBENCH_STARTUP = new InjectionToken<WorkbenchInitializer | any>('WORKBENCH_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed immediately when calling {@link WorkbenchLauncher#launch},
 * but before running workbench initializers associated with the {@link WORKBENCH_STARTUP} injection token.
 *
 * If microfrontend support is enabled, you can configure the "SCION Microfrontend Platform" in this lifecycle hook, for example,
 * register interceptors or decorators. However, you cannot interact with the platform yet, because it has not been started yet.
 */
export const WORKBENCH_PRE_STARTUP = new InjectionToken<WorkbenchInitializer | any>('WORKBENCH_PRE_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * This lifecycle hook is only called if microfrontend support is enabled.
 *
 * Initializers registered under this DI token are injected and executed after bootstrapping the "SCION Microfrontend Platform".
 * At this point, the activators of the micro applications are not yet installed. Typically, you would install intent and message
 * handlers in this lifecycle hook.
 */
export const MICROFRONTEND_PLATFORM_POST_STARTUP = new InjectionToken<WorkbenchInitializer | any>('MICROFRONTEND_PLATFORM_POST_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed just before the {@link WorkbenchLauncher} completes the workbench
 * startup, that is, after all initializers associated with the {@link WORKBENCH_STARTUP} DI token have completed initialization.
 */
export const WORKBENCH_POST_STARTUP = new InjectionToken<WorkbenchInitializer | any>('WORKBENCH_POST_STARTUP');

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
 * - {@link WORKBENCH_PRE_STARTUP}
 * - {@link WORKBENCH_STARTUP}
 * - {@link WORKBENCH_POST_STARTUP}
 * - {@link MICROFRONTEND_PLATFORM_POST_STARTUP}
 *
 * ### Example of how to associate an initializer with the DI token {@link MICROFRONTEND_PLATFORM_POST_STARTUP}.
 *
 * ```typescript
 * @NgModule({
 *   ...
 *   providers: [
 *     {
 *       provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
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

