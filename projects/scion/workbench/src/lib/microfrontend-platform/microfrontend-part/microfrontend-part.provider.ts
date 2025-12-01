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
import {CapabilityInterceptor, HostManifestInterceptor} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {provideStableCapabilityId} from '../stable-capability-id-assigner.provider';
import {MicrofrontendPartCapabilityValidator} from './microfrontend-part-capability-validator.interceptor';
import {provideMicrofrontendPartRoute} from './microfrontend-part-routes';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendPartIntentionProvider} from './microfrontend-part-intention-provider.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend part support.
 *
 * @see WorkbenchPartCapability
 */
export function provideMicrofrontendPart(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPartIntentionProvider,
    MicrofrontendPartCapabilityValidator,
    provideMicrofrontendPartRoute(),
    provideStableCapabilityId(WorkbenchCapabilities.Part),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add part intention to the host manifest for the workbench to read part capabilities.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendPartIntentionProvider), multi: true});
    // Register part capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPartCapabilityValidator), multi: true});
  }
}
