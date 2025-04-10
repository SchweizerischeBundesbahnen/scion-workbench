/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer, provideWorkbenchInitializer, WorkbenchStartup, WorkbenchStartupPhase} from '@scion/workbench';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';

/**
 * Provides a set of DI providers to log invocation of workbench lifecycle hooks.
 */
export function provideWorkbenchLifecycleHookLoggers(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbenchInitializer(() => log('WORKBENCH_PRE_STARTUP'), {phase: WorkbenchStartupPhase.PreStartup}),
    provideWorkbenchInitializer(() => log('WORKBENCH_STARTUP'), {phase: WorkbenchStartupPhase.Startup}),
    provideWorkbenchInitializer(() => log('WORKBENCH_POST_STARTUP'), {phase: WorkbenchStartupPhase.PostStartup}),
    provideMicrofrontendPlatformInitializer(() => log('MICROFRONTEND_PLATFORM_PRE_STARTUP'), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
    provideMicrofrontendPlatformInitializer(() => log('MICROFRONTEND_PLATFORM_POST_STARTUP'), {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

function log(phase: string): void {
  console.debug(`[WorkbenchLifecycleHookLogger][${phase}] [microfrontendPlatformState=${PlatformState[MicrofrontendPlatform.state]}, workbenchStarted=${inject(WorkbenchStartup).done()}]`);
}
