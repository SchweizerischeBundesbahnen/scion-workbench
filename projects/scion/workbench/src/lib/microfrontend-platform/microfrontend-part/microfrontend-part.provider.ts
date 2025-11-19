/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {STABLE_CAPABILITY_ID} from '../stable-capability-id-assigner.interceptor';
import {MicrofrontendPartCapabilityValidator} from './microfrontend-part-capability-validator.interceptor';
import {provideMicrofrontendPartRoute} from './microfrontend-part-routes';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';

/**
 * Provides a set of DI providers registering parts provided as part capabilities.
 */
export function provideMicrofrontendPart(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPartCapabilityValidator,
    provideMicrofrontendPartRoute(),
    {provide: STABLE_CAPABILITY_ID, useValue: WorkbenchCapabilities.Part, multi: true},
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPartCapabilityValidator), multi: true});
  }
}
