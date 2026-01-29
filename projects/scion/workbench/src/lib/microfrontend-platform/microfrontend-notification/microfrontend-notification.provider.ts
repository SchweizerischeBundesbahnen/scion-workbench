/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendTextNotificationCapabilityProvider} from './microfrontend-text-notification-capability-provider.interceptor';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendNotificationIntentHandler} from './microfrontend-notification-intent-handler.interceptor';
import {provideMicrofrontendTextNotificationRoute} from './microfrontend-notification-routes';
import {MicrofrontendNotificationCapabilityValidator} from './microfrontend-notification-capability-validator.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend notification support.
 *
 * @see WorkbenchNotificationCapability
 */
export function provideMicrofrontendNotification(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendNotificationCapabilityValidator,
    MicrofrontendTextNotificationCapabilityProvider,
    MicrofrontendNotificationIntentHandler,
    provideMicrofrontendTextNotificationRoute(),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Register built-in text notification capability in the host manifest.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendTextNotificationCapabilityProvider), multi: true});
    // Register notification capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendNotificationCapabilityValidator), multi: true});
    // Register notification intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendNotificationIntentHandler), multi: true});
  }
}
