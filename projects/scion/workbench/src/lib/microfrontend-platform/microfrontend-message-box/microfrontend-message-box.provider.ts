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
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendMessageBoxIntentHandler} from './microfrontend-message-box-intent-handler.interceptor';
import {MicrofrontendMessageBoxCapabilityValidator} from './microfrontend-message-box-capability-validator.interceptor';
import {provideMicrofrontendTextMessageBoxRoute} from './microfrontend-message-box-routes';
import {MicrofrontendTextMessageBoxCapabilityProvider} from './microfrontend-text-message-box-capability-provider.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend message box support.
 *
 * @see WorkbenchMessageBoxCapability
 */
export function provideMicrofrontendMessageBox(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendMessageBoxCapabilityValidator,
    MicrofrontendMessageBoxIntentHandler,
    MicrofrontendTextMessageBoxCapabilityProvider,
    provideMicrofrontendTextMessageBoxRoute(),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add built-in text message box capability to the host manifest.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendTextMessageBoxCapabilityProvider), multi: true});
    // Register message box capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendMessageBoxCapabilityValidator), multi: true});
    // Register messagebox intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendMessageBoxIntentHandler), multi: true});
  }
}
