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
 * Initializers are used to run initialization tasks during startup of the SCION Workbench.
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
  const token = WORKBENCH_STARTUP_TOKENS.get(options?.phase ?? WorkbenchStartupPhase.Startup);
  return makeEnvironmentProviders([{
    provide: token,
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
 * Initializers are used to run initialization tasks during startup of the SCION Workbench.
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
 * @example - Registration of an initializer function
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
 * @see provideWorkbenchInitializer
 */
export type WorkbenchInitializerFn = () => void | Promise<void>;

/**
 * Runs workbench initializers in the given phase. Initializer functions can call `inject` to get required dependencies.
 */
export async function runWorkbenchInitializers(phase: WorkbenchStartupPhase, injector: Injector): Promise<void> {
  const token = WORKBENCH_STARTUP_TOKENS.get(phase)!;
  const initializers = injector.get<WorkbenchInitializerFn[]>(token, [], {optional: true});
  if (!initializers.length) {
    return;
  }

  // Run and await initializer functions in parallel.
  await Promise.all(initializers.map(initializer => runInInjectionContext(injector, initializer)));
}

/**
 * Associates Workbench startup phases with Workbench DI tokens.
 */
const WORKBENCH_STARTUP_TOKENS = new Map<WorkbenchStartupPhase, InjectionToken<WorkbenchInitializerFn>>()
  .set(WorkbenchStartupPhase.PreStartup, new InjectionToken<WorkbenchInitializerFn>('WORKBENCH_PRE_STARTUP'))
  .set(WorkbenchStartupPhase.Startup, new InjectionToken<WorkbenchInitializerFn>('WORKBENCH_STARTUP'))
  .set(WorkbenchStartupPhase.PostStartup, new InjectionToken<WorkbenchInitializerFn>('WORKBENCH_POST_STARTUP'));
