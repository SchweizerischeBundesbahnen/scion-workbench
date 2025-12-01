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
import {provideNotificationIntentHandler} from './microfrontend-notification-intent-handler';
import {Beans} from '@scion/toolkit/bean-manager';
import {HostManifestInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendTextNotificationCapabilityProvider} from './microfrontend-text-notification-capability-provider.interceptor';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';

/**
 * Provides a set of DI providers enabling microfrontend notification support.
 *
 * @see WorkbenchNotificationCapability
 */
export function provideMicrofrontendNotification(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendTextNotificationCapabilityProvider,
    provideNotificationIntentHandler(),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Register built-in text notification capability in the host manifest.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendTextNotificationCapabilityProvider), multi: true});
  }
}
