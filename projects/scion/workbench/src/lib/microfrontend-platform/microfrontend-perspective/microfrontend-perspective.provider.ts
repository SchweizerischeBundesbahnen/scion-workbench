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
import {MicrofrontendPerspectiveInstaller} from './microfrontend-perspective-installer.service';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPerspectiveIntentHandler} from './microfrontend-perspective-intent-handler.interceptor';
import {MicrofrontendPerspectiveCapabilityMigrator} from './microfrontend-perspective-capability-migrator.interceptor';
import {MicrofrontendPerspectiveCapabilityValidator} from './microfrontend-perspective-capability-validator.interceptor';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {STABLE_CAPABILITY_ID} from '../stable-capability-id-assigner.interceptor';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';

/**
 * Provides a set of DI providers registering perspectives provided as perspective capabilities.
 */
export function provideMicrofrontendPerspective(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPerspectiveInstaller,
    MicrofrontendPerspectiveCapabilityMigrator,
    MicrofrontendPerspectiveCapabilityValidator,
    MicrofrontendPerspectiveIntentHandler,
    {provide: STABLE_CAPABILITY_ID, useValue: WorkbenchCapabilities.Perspective, multi: true},
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
    provideMicrofrontendPlatformInitializer(onPostStartup, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);

  function onPreStartup(): void {
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPerspectiveCapabilityMigrator), multi: true});
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPerspectiveCapabilityValidator), multi: true});
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendPerspectiveIntentHandler), multi: true});
  }

  function onPostStartup(): void {
    inject(MicrofrontendPerspectiveInstaller);
  }
}
