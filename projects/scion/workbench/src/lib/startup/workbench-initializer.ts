/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, Injector, runInInjectionContext} from '@angular/core';

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed immediately when calling {@link WorkbenchLauncher#launch}.
 * After all initializers associated with this DI token have completed, the workbench transitions into the "started" state.
 *
 * An initializer can be any object and is to be provided as a multi-provider. If the initializer is a function or instance of
 * {@link WorkbenchInitializer} and returns a Promise, the workbench waits for the Promise to be resolved before proceeding with the startup.
 * Initializers can call `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 */
export const WORKBENCH_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed immediately when calling {@link WorkbenchLauncher#launch},
 * but before running workbench initializers associated with the {@link WORKBENCH_STARTUP} injection token.
 *
 * An initializer can be any object and is to be provided as a multi-provider. If the initializer is a function or instance of
 * {@link WorkbenchInitializer} and returns a Promise, the workbench waits for the Promise to be resolved before proceeding with the startup.
 * Initializers can call `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 */
export const WORKBENCH_PRE_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_PRE_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed before starting the SCION Microfrontend Platform.
 * Typically, you would configure the SCION Microfrontend Platform in this lifecycle hook, for example, register interceptors or decorators.
 *
 * This lifecycle hook is only called if microfrontend support is enabled. Note that you cannot interact with the microfrontend platform
 * in this lifecycle hook because it has not been started yet.
 *
 * An initializer can be any object and is to be provided as a multi-provider. If the initializer is a function or instance of
 * {@link WorkbenchInitializer} and returns a Promise, the workbench waits for the Promise to be resolved before proceeding with the startup.
 * Initializers can call `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 */
export const MICROFRONTEND_PLATFORM_PRE_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('MICROFRONTEND_PLATFORM_PRE_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed after started the SCION Microfrontend Platform.
 * At this point, the activators of the micro applications are not yet installed. Typically, you would install intent and message
 * handlers in this lifecycle hook.
 *
 * This lifecycle hook is only called if microfrontend support is enabled.
 *
 * An initializer can be any object and is to be provided as a multi-provider. If the initializer is a function or instance of
 * {@link WorkbenchInitializer} and returns a Promise, the workbench waits for the Promise to be resolved before proceeding with the startup.
 * Initializers can call `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 */
export const MICROFRONTEND_PLATFORM_POST_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('MICROFRONTEND_PLATFORM_POST_STARTUP');

/**
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * Initializers registered under this DI token are injected and executed just before the {@link WorkbenchLauncher} completes the workbench
 * startup, that is, after all initializers associated with the {@link WORKBENCH_STARTUP} DI token have completed initialization.
 *
 * An initializer can be any object and is to be provided as a multi-provider. If the initializer is a function or instance of
 * {@link WorkbenchInitializer} and returns a Promise, the workbench waits for the Promise to be resolved before proceeding with the startup.
 * Initializers can call `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 */
export const WORKBENCH_POST_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_POST_STARTUP');

/**
 * The signature of a function to hook into the startup of the SCION Workbench.
 *
 * If the function returns a Promise, the workbench startup does not complete until the Promise is resolved.
 * Functions associated with the same DI token run in parallel. The function can call `inject` to get any
 * required dependencies.
 *
 * Following DI tokens are available as hooks into the workbench's startup process, listed in the order in which they are injected and
 * executed.
 *
 * - {@link WORKBENCH_PRE_STARTUP}
 * - {@link WORKBENCH_STARTUP}
 * - {@link WORKBENCH_POST_STARTUP}
 * - {@link MICROFRONTEND_PLATFORM_PRE_STARTUP}
 * - {@link MICROFRONTEND_PLATFORM_POST_STARTUP}
 */
export type WorkbenchInitializerFn = () => void | Promise<void>;

/**
 * Allows initializing the application during workbench startup.
 *
 * The SCION Workbench defines a number of injection tokens (also called DI tokens) as hooks into the workbench's startup process.
 * Hooks are called at defined points during startup, enabling the application's controlled initialization.
 *
 * The application can associate one or more initializers with any of these DI tokens. An initializer can be any object and is to be
 * provided as a multi-provider. If the initializer is a function or instance of {@link WorkbenchInitializer}, which defines a single
 * method, `init`, the workbench waits for its returned Promise to resolve before proceeding with the startup. Initializers can call
 * `inject` to get any required dependencies. Initializers associated with the same DI token may run in parallel.
 *
 * Following DI tokens are available as hooks into the workbench's startup process, listed in the order in which they are injected and
 * executed.
 *
 * - {@link WORKBENCH_PRE_STARTUP}
 * - {@link WORKBENCH_STARTUP}
 * - {@link WORKBENCH_POST_STARTUP}
 * - {@link MICROFRONTEND_PLATFORM_PRE_STARTUP}
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
 * Runs workbench initializers associated with the given DI token. Initializer functions can call `inject` to get any required dependencies.
 */
export async function runWorkbenchInitializers(token: InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>, injector: Injector): Promise<void> {
  const initializers = injector.get(token, [], {optional: true}) as Array<WorkbenchInitializerFn | WorkbenchInitializer | object>;
  if (!initializers.length) {
    return;
  }

  // Run and await initializer functions.
  await Promise.all(initializers
    .filter((initializer): initializer is WorkbenchInitializerFn | WorkbenchInitializer => typeof initializer === 'function' || typeof (initializer as Partial<WorkbenchInitializer>).init === 'function')
    .reduce((acc, initializer) => runInInjectionContext(injector, () => {
      return acc.concat(typeof initializer === 'function' ? initializer() : initializer.init());
    }), new Array<void | Promise<void>>()));
}
