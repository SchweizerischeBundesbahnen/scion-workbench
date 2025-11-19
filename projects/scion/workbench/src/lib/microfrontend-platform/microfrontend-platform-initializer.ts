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
 * Registers a function that is executed during the startup of the SCION Microfrontend Platform.
 *
 * Initializers are used to run initialization tasks during startup of the SCION Microfrontend Platform.
 * The SCION Microfrontend Platform is fully started once all initializers have completed.
 *
 * Initializers can specify a phase for execution. Initializers in lower phases execute before initializers in higher phases.
 * Initializers in the same phase may execute in parallel. If no phase is specified, the initializer executes in the `PostStartup` phase.
 *
 * Available phases, in order of execution:
 * - {@link MicrofrontendPlatformStartupPhase.PreStartup}
 * - {@link MicrofrontendPlatformStartupPhase.PostStartup}
 *
 * Microfrontend platform initializers run during the {@link WorkbenchStartupPhase.Startup} phase.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * Initializers are only called if microfrontend support is enabled.
 *
 * @param initializerFn - Specifies the function to execute.
 * @param options - Controls execution of the function.
 * @return A set of dependency-injection providers to be registered in Angular.
 */
export function provideMicrofrontendPlatformInitializer(initializerFn: MicrofrontendPlatformInitializerFn, options?: MicrofrontendPlatformInitializerOptions): EnvironmentProviders {
  const token = MICROFRONTEND_PLATFORM_STARTUP_TOKENS.get(options?.phase ?? MicrofrontendPlatformStartupPhase.PostStartup);
  return makeEnvironmentProviders([{
    provide: token,
    useValue: initializerFn,
    multi: true,
  }]);
}

/**
 * Controls the execution of an initializer function during the startup of the SCION Microfrontend Platform.
 */
export interface MicrofrontendPlatformInitializerOptions {
  /**
   * Controls in which phase to execute the initializer.
   */
  phase?: MicrofrontendPlatformStartupPhase;
}

/**
 * Enumeration of phases for running a {@link MicrofrontendPlatformInitializerFn} function during the startup of the SCION Microfrontend Platform.
 *
 * Functions associated with the same phase may run in parallel. Defaults to {@link PostStartup} phase.
 */
export enum MicrofrontendPlatformStartupPhase {
  /**
   * Use to run an initializer before starting the SCION Microfrontend Platform.
   *
   * Typically, you would configure the SCION Microfrontend Platform in this phase, for example, register interceptors or decorators.
   * At this point, you cannot interact with the Microfrontend Platform because it has not been started yet.
   *
   * This phase is only called if microfrontend support is enabled.
   */
  PreStartup = 0,
  /**
   * Use to run an initializer after started the SCION Microfrontend Platform.
   *
   * Typically, you would install intent and message handlers in this phase.
   * At this point, the activators of the micro applications are not yet installed.
   *
   * This is the default phase if not specifying a phase.
   *
   * This phase is only called if microfrontend support is enabled.
   */
  PostStartup = 2,
}

/**
 * The signature of a function executed during the startup of the SCION Microfrontend Platform.
 *
 * Initializers are used to run initialization tasks during startup of the SCION Microfrontend Platform.
 *
 * Initializers are registered using the `provideMicrofrontendPlatformInitializer()` function and can specify a phase for execution.
 * Initializers in lower phases execute before initializers in higher phases. Initializers in the same phase may
 * execute in parallel. If no phase is specified, the initializer executes in the `PostStartup` phase.
 *
 * Microfrontend platform initializers run during the {@link WorkbenchStartupPhase.Startup} phase.
 *
 * Available phases, in order of execution:
 * - {@link MicrofrontendPlatformStartupPhase.PreStartup}
 * - {@link MicrofrontendPlatformStartupPhase.PostStartup}
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @example - Registration of an initializer function
 * ```ts
 * import {provideWorkbench, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideMicrofrontendPlatformInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 * @see provideMicrofrontendPlatformInitializer
 */
export type MicrofrontendPlatformInitializerFn = () => void | Promise<void>;

/**
 * Runs microfrontend platform initializers in the given phase. Initializer functions can call `inject` to get required dependencies.
 *
 * Microfrontend platform initializers run during startup of the SCION Microfrontend Platform and only execute if microfrontend support is enabled.
 */
export async function runMicrofrontendPlatformInitializers(phase: MicrofrontendPlatformStartupPhase, injector: Injector): Promise<void> {
  const token = MICROFRONTEND_PLATFORM_STARTUP_TOKENS.get(phase)!;
  const initializers = injector.get<MicrofrontendPlatformInitializerFn[]>(token, [], {optional: true});
  if (!initializers.length) {
    return;
  }

  // Run and await initializer functions in parallel.
  await Promise.all(initializers.map(initializer => runInInjectionContext(injector, initializer)));
}

/**
 * Associates Microfrontend Platform startup phases with Workbench DI tokens.
 */
const MICROFRONTEND_PLATFORM_STARTUP_TOKENS = new Map<MicrofrontendPlatformStartupPhase, InjectionToken<MicrofrontendPlatformInitializerFn>>()
  .set(MicrofrontendPlatformStartupPhase.PreStartup, new InjectionToken<MicrofrontendPlatformInitializerFn>('MICROFRONTEND_PLATFORM_PRE_STARTUP'))
  .set(MicrofrontendPlatformStartupPhase.PostStartup, new InjectionToken<MicrofrontendPlatformInitializerFn>('MICROFRONTEND_PLATFORM_POST_STARTUP'));
