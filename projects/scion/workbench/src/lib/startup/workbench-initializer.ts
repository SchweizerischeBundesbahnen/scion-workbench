/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, InjectionToken, Injector, makeEnvironmentProviders, runInInjectionContext} from '@angular/core';

/**
 * Registers a function that is executed during the startup of the SCION Workbench.
 *
 * Initializers help to run initialization tasks (synchronous or asynchronous) during startup of the SCION Workbench.
 * The workbench is fully started once all initializers have completed.
 *
 * Initializers can specify a phase for execution. Initializers in lower phases execute before initializers in higher phases.
 * Initializers in the same phase may execute in parallel. If no phase is specified, the initializer executes in the `Startup` phase.
 *
 * Available phases, in order of execution:
 * - {@link WorkbenchStartupPhase.PreStartup}
 * - {@link WorkbenchStartupPhase.Startup}
 * - {@link WorkbenchStartupPhase.PostStartup}
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @param initializerFn - Specifies the function to execute.
 * @param options - Controls execution of the function.
 * @return A set of dependency-injection providers to be registered in Angular.
 */
export function provideWorkbenchInitializer(initializerFn: WorkbenchInitializerFn, options?: WorkbenchInitializerOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: (() => {
      switch (options?.phase) {
        case WorkbenchStartupPhase.PreStartup:
          return WORKBENCH_PRE_STARTUP;
        case WorkbenchStartupPhase.PostStartup:
          return WORKBENCH_POST_STARTUP;
        default:
          return WORKBENCH_STARTUP;
      }
    })(),
    useValue: initializerFn,
    multi: true,
  }]);
}

/**
 * Controls the execution of an initializer function during the startup of the SCION Workbench.
 */
export interface WorkbenchInitializerOptions {
  /**
   * Controls in which phase to execute the initializer.
   */
  phase?: WorkbenchStartupPhase;
}

/**
 * Enumeration of phases for running a {@link WorkbenchInitializerFn} function during the startup of the SCION Workbench.
 *
 * Functions associated with the same phase may run in parallel. Defaults to {@link Startup} phase.
 */
export enum WorkbenchStartupPhase {
  /**
   * Use to run an initializer before starting the workbench.
   */
  PreStartup = 0,
  /**
   * Use to run an initializer function after initializers of the {@link PreStartup} phase.
   *
   * This is the default phase if not specifying a phase.
   */
  Startup = 1,
  /**
   * Use to run an initializer function after initializers of the {@link Startup} phase.
   */
  PostStartup = 2,
}

/**
 * The signature of a function executed during the startup of the SCION Workbench.
 *
 * Initializers help to run initialization tasks (synchronous or asynchronous) during startup of the SCION Workbench.
 * The workbench is fully started once all initializers have completed.
 *
 * Initializers are registered using the `provideWorkbenchInitializer()` function and can specify a phase for execution.
 * Initializers in lower phases execute before initializers in higher phases. Initializers in the same phase may
 * execute in parallel. If no phase is specified, the initializer executes in the `Startup` phase.
 *
 * Available phases, in order of execution:
 * - {@link WorkbenchStartupPhase.PreStartup}
 * - {@link WorkbenchStartupPhase.Startup}
 * - {@link WorkbenchStartupPhase.PostStartup}
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ### Example:
 *
 * ```ts
 * import {provideWorkbench, provideWorkbenchInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideWorkbench(),
 *     provideWorkbenchInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 * @see provideWorkbenchInitializer
 */
export type WorkbenchInitializerFn = () => void | Promise<void>;

/**
 * The signature of a class to hook into the startup of the SCION Workbench.
 *
 * The SCION Workbench defines a set of DI tokens called at defined points during startup, enabling the application's controlled initialization.
 *
 * Available DI tokens, in order of execution:
 * - {@link WORKBENCH_PRE_STARTUP}
 * - {@link WORKBENCH_STARTUP}
 * - {@link WORKBENCH_POST_STARTUP}
 *
 * ### Example:
 *
 * ```ts
 * import {provideWorkbench, WORKBENCH_STARTUP, WorkbenchInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {Injectable} from '@angular/core';
 *
 * @Injectable()
 * export class Initializer implements WorkbenchInitializer {
 *   public async init(): Promise<void> {
 *     // initialize application
 *   }
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideWorkbench(),
 *     {
 *       provide: WORKBENCH_STARTUP,
 *       multi: true,
 *       useClass: Initializer,
 *     },
 *   ],
 * });
 * ```
 * @see WORKBENCH_PRE_STARTUP
 * @see WORKBENCH_STARTUP
 * @see WORKBENCH_POST_STARTUP
 *
 * @deprecated since version 19.0.0-beta.3. Register an initializer function instead. The function can call `inject` to get required dependencies. See `WorkbenchInitializerFn` for an example. API will be removed in version 21.
 */
export interface WorkbenchInitializer {

  /**
   * This method is called during the startup of the SCION Workbench.
   *
   * The method can call `inject` to get required dependencies.
   *
   * @return A Promise blocking startup until it resolves.
   */
  init(): Promise<void>;
}

/**
 * DI token to register a {@link WorkbenchInitializerFn} as a multi-provider to hook into the startup process of the SCION Workbench.
 *
 * Initializers associated with this DI token are executed before starting the SCION Workbench.
 *
 * @see WorkbenchInitializerFn
 * @deprecated since version 19.0.0-beta.3. Register initializer using `provideWorkbenchInitializer` function. See `provideWorkbenchInitializer` for an example. API will be removed in version 21.
 */
export const WORKBENCH_PRE_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_PRE_STARTUP');

/**
 * DI token to register a {@link WorkbenchInitializerFn} as a multi-provider to hook into the startup process of the SCION Workbench.
 *
 * Initializers associated with this DI token are executed after initializers of {@link WORKBENCH_PRE_STARTUP}.
 *
 * @see WorkbenchInitializerFn
 * @deprecated since version 19.0.0-beta.3. Register initializer using `provideWorkbenchInitializer` function. See `provideWorkbenchInitializer` for an example. API will be removed in version 21.
 */
export const WORKBENCH_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_STARTUP');

/**
 * DI token to register a {@link WorkbenchInitializerFn} as a multi-provider to hook into the startup process of the SCION Workbench.
 *
 * Initializers associated with this DI token are executed after initializers of {@link WORKBENCH_STARTUP}.
 *
 * @see WorkbenchInitializerFn
 * @deprecated since version 19.0.0-beta.3. Register initializer using `provideWorkbenchInitializer` function. See `provideWorkbenchInitializer` for an example. API will be removed in version 21.
 */
export const WORKBENCH_POST_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('WORKBENCH_POST_STARTUP');

/**
 * Runs workbench initializers associated with the given DI token. Initializer functions can call `inject` to get required dependencies.
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
