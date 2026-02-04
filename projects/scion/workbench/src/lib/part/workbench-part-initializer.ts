/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, InjectionToken, makeEnvironmentProviders} from '@angular/core';

/**
 * Registers a function that is executed during the creation of each part.
 *
 * Initializers are used to run initialization tasks during creation of each part.
 *
 * The function can call `inject` to get any required dependencies, such as the `WorkbenchPart`.
 *
 * @param initializerFn - Specifies the function to execute.
 * @return A set of dependency-injection providers to be registered in Angular.
 */
export function provideWorkbenchPartInitializer(initializerFn: WorkbenchPartInitializerFn): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: WORKBENCH_PART_INITIALIZER,
    useValue: initializerFn,
    multi: true,
  }]);
}

/**
 * The signature of a function executed during the creation of each part.
 *
 * Initializers are used to run initialization tasks during creation of each part.
 *
 * Initializers are registered using the `provideWorkbenchPartInitializer()` function.
 *
 * The function can call `inject` to get any required dependencies, such as the `WorkbenchPart`.
 *
 * @example - Registration of an initializer function
 * ```ts
 * import {provideWorkbench, provideWorkbenchPartInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideWorkbenchPartInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 * @see provideWorkbenchPartInitializer
 */
export type WorkbenchPartInitializerFn = () => void | Promise<void>;

/**
 * DI token to provide part initializer functions.
 */
export const WORKBENCH_PART_INITIALIZER = new InjectionToken<WorkbenchPartInitializerFn[]>('WORKBENCH_PART_INITIALIZER');
