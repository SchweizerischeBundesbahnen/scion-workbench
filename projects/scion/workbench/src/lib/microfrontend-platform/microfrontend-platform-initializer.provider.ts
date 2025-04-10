/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, InjectionToken, makeEnvironmentProviders} from '@angular/core';
import {WorkbenchInitializer, WorkbenchInitializerFn} from './../startup/workbench-initializer';

/**
 * Registers a function that is executed during the startup of the SCION Microfrontend Platform.
 *
 * Initializers help to run initialization tasks (synchronous or asynchronous) during startup of the SCION Microfrontend Platform.
 *
 * Initializers can specify a phase for execution. Initializers in lower phases execute before initializers in higher phases.
 * Initializers in the same phase may execute in parallel. If no phase is specified, the initializer executes in the `PostStartup` phase.
 *
 * Available phases, in order of execution:
 * - {@link MicrofrontendPlatformStartupPhase.PreStartup}
 * - {@link MicrofrontendPlatformStartupPhase.PostStartup}
 *
 * The function can call `inject` to get any required dependencies.
 *
 * Initializers are only called if microfrontend support is enabled.
 *
 * @param initializerFn - Specifies the function to execute.
 * @param options - Controls execution of the function.
 * @return A set of dependency-injection providers to be registered in Angular.
 */
export function provideMicrofrontendPlatformInitializer(initializerFn: WorkbenchInitializerFn, options?: MicrofrontendPlatformInitializerOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: options?.phase === MicrofrontendPlatformStartupPhase.PreStartup ? MICROFRONTEND_PLATFORM_PRE_STARTUP : MICROFRONTEND_PLATFORM_POST_STARTUP,
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
 * Enumeration of phases for running a {@link WorkbenchInitializerFn} function during the startup of the SCION Microfrontend Platform.
 *
 * Functions associated with the same phase may run in parallel. Defaults to {@link PostStartup} phase.
 */
export enum MicrofrontendPlatformStartupPhase {
  /**
   * Use to run an initializer before starting the SCION Microfrontend Platform.
   *
   * Typically, you would configure the SCION Microfrontend Platform in this phase, for example, register interceptors or decorators.
   * At this point, you cannot interact with the microfrontend platform because it has not been started yet.
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
   * This phase is only called if microfrontend support is enabled.
   */
  PostStartup = 2,
}

/**
 * DI token to register a {@link WorkbenchInitializerFn} as a multi-provider to hook into the startup process of the SCION Microfrontend Platform.
 *
 * Initializers associated with this DI token are executed during {@link WORKBENCH_STARTUP} before starting the SCION Microfrontend Platform.
 *
 * Typically, you would configure the SCION Microfrontend Platform in this lifecycle hook, for example, register interceptors or decorators.
 * At this point, you cannot interact with the microfrontend platform because it has not been started yet.
 *
 * This lifecycle hook is only called if microfrontend support is enabled.
 *
 * @see WorkbenchInitializerFn
 * @deprecated since version 19.0.0-beta.3. Register initializer using `provideMicrofrontendPlatformInitializer` function. See `provideMicrofrontendPlatformInitializer` for an example. API will be removed in version 21.
 */
export const MICROFRONTEND_PLATFORM_PRE_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('MICROFRONTEND_PLATFORM_PRE_STARTUP');

/**
 * DI token to register a {@link WorkbenchInitializerFn} as a multi-provider to hook into the startup process of the SCION Microfrontend Platform.
 *
 * Initializers associated with this DI token are executed during {@link WORKBENCH_STARTUP} after started the SCION Microfrontend Platform.
 *
 * Typically, you would install intent and message handlers in this lifecycle hook.
 * At this point, the activators of the micro applications are not yet installed.
 *
 * This lifecycle hook is only called if microfrontend support is enabled.
 *
 * @see WorkbenchInitializerFn
 * @deprecated since version 19.0.0-beta.3. Register initializer using `provideMicrofrontendPlatformInitializer` function. See `provideMicrofrontendPlatformInitializer` for an example. API will be removed in version 21.
 */
export const MICROFRONTEND_PLATFORM_POST_STARTUP = new InjectionToken<WorkbenchInitializerFn | WorkbenchInitializer | object>('MICROFRONTEND_PLATFORM_POST_STARTUP');
