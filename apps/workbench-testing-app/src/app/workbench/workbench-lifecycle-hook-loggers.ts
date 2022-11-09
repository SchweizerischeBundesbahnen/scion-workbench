/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, InjectionToken, Provider} from '@angular/core';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP, WorkbenchInitializer, WorkbenchStartup} from '@scion/workbench';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';

/**
 * Enables logging of invocations of workbench-specific lifecycle hooks.
 */
export function provideWorkbenchLifecycleHookLoggers(): Provider[] {
  return [
    {
      provide: WORKBENCH_PRE_STARTUP,
      multi: true,
      useFactory: () => new WorkbenchLifecycleHookLogger(WORKBENCH_PRE_STARTUP),
    },
    {
      provide: WORKBENCH_STARTUP,
      multi: true,
      useFactory: () => new WorkbenchLifecycleHookLogger(WORKBENCH_STARTUP),
    },
    {
      provide: WORKBENCH_POST_STARTUP,
      multi: true,
      useFactory: () => new WorkbenchLifecycleHookLogger(WORKBENCH_POST_STARTUP),
    },
    {
      provide: MICROFRONTEND_PLATFORM_PRE_STARTUP,
      multi: true,
      useFactory: () => new WorkbenchLifecycleHookLogger(MICROFRONTEND_PLATFORM_PRE_STARTUP),
    },
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      multi: true,
      useFactory: () => new WorkbenchLifecycleHookLogger(MICROFRONTEND_PLATFORM_POST_STARTUP),
    },
  ];
}

/**
 * Represents an initializer that logs its construction and invocation.
 */
export class WorkbenchLifecycleHookLogger implements WorkbenchInitializer {

  private _workbenchStartup: WorkbenchStartup;

  constructor(private _lifecycleHook: InjectionToken<WorkbenchInitializer | any>) {
    this._workbenchStartup = inject(WorkbenchStartup);
    console.debug(`[WorkbenchLifecycleHookLogger#construct][${this._lifecycleHook}] [microfrontendPlatformState=${PlatformState[MicrofrontendPlatform.state]}, workbenchStarted=${this._workbenchStartup.isStarted()}]`);
  }

  public async init(): Promise<void> {
    console.debug(`[WorkbenchLifecycleHookLogger#init][${this._lifecycleHook}] [microfrontendPlatformState=${PlatformState[MicrofrontendPlatform.state]}, workbenchStarted=${this._workbenchStartup.isStarted()}]`);
  }
}
