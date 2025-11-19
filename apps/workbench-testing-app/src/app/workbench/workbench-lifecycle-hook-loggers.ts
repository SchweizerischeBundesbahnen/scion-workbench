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
    provideWorkbenchInitializer(() => log('WorkbenchStartupPhase.PreStartup'), {phase: WorkbenchStartupPhase.PreStartup}),
    provideWorkbenchInitializer(() => log('WorkbenchStartupPhase.Startup'), {phase: WorkbenchStartupPhase.Startup}),
    provideWorkbenchInitializer(() => log('WorkbenchStartupPhase.PostStartup'), {phase: WorkbenchStartupPhase.PostStartup}),
    provideMicrofrontendPlatformInitializer(() => log('MicrofrontendPlatformStartupPhase.PreStartup'), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
    provideMicrofrontendPlatformInitializer(() => log('MicrofrontendPlatformStartupPhase.PostStartup'), {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

function log(phase: string): void {
  console.debug(`[WorkbenchLifecycleHookLogger][${phase}] [microfrontendPlatformState=${PlatformState[MicrofrontendPlatform.state]}, workbenchStarted=${inject(WorkbenchStartup).done()}]`);
}
